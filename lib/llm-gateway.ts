import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

export interface LLMMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface LLMImageMessage {
  role: "user"
  content: Array<{
    type: "text" | "image_url"
    text?: string
    image_url?: {
      url: string
    }
  }>
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  provider: string
  model: string
}

export class LLMGateway {
  private openai: OpenAI | null = null
  private gemini: GoogleGenerativeAI | null = null
  private providers: string[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Get provider priority from environment
    const providerConfig = process.env.LLM_PROVIDERS || "openai,gemini"
    this.providers = providerConfig.split(",").map(p => p.trim())

    // Initialize OpenAI if configured
    if (process.env.OPENAI_API_KEY && this.providers.includes("openai")) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }

    // Initialize Gemini if configured
    if (process.env.GEMINI_API_KEY && this.providers.includes("gemini")) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    }

    console.log(`LLM Gateway initialized with providers: ${this.providers.join(", ")}`)
  }

  async generateText(
    messages: LLMMessage[],
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    } = {}
  ): Promise<LLMResponse> {
    const errors: string[] = []

    for (const provider of this.providers) {
      try {
        switch (provider) {
          case "openai":
            if (this.openai) {
              return await this.callOpenAI(messages, options)
            }
            break
          case "gemini":
            if (this.gemini) {
              return await this.callGemini(messages, options)
            }
            break
        }
      } catch (error) {
        const errorMsg = `${provider} failed: ${error instanceof Error ? error.message : "Unknown error"}`
        console.warn(errorMsg)
        errors.push(errorMsg)
        continue
      }
    }

    throw new Error(`All LLM providers failed: ${errors.join("; ")}`)
  }

  async generateWithVision(
    message: LLMImageMessage,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    } = {}
  ): Promise<LLMResponse> {
    const errors: string[] = []

    for (const provider of this.providers) {
      try {
        switch (provider) {
          case "openai":
            if (this.openai) {
              return await this.callOpenAIVision(message, options)
            }
            break
          case "gemini":
            if (this.gemini) {
              return await this.callGeminiVision(message, options)
            }
            break
        }
      } catch (error) {
        const errorMsg = `${provider} vision failed: ${error instanceof Error ? error.message : "Unknown error"}`
        console.warn(errorMsg)
        errors.push(errorMsg)
        continue
      }
    }

    throw new Error(`All vision-capable LLM providers failed: ${errors.join("; ")}`)
  }

  private async callOpenAI(
    messages: LLMMessage[],
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    }
  ): Promise<LLMResponse> {
    if (!this.openai) throw new Error("OpenAI not initialized")

    const model = options.model || "gpt-4o-mini"
    const temperature = options.temperature ?? 0.3
    const maxTokens = options.maxTokens ?? 1000

    const openaiMessages = messages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }))

    const completion = await this.openai.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature,
      max_tokens: maxTokens,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No response from OpenAI")

    return {
      content,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
      provider: "openai",
      model,
    }
  }

  private async callGemini(
    messages: LLMMessage[],
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    }
  ): Promise<LLMResponse> {
    if (!this.gemini) throw new Error("Gemini not initialized")

    const model = options.model || "gemini-1.5-flash"
    const temperature = options.temperature ?? 0.3
    const maxTokens = options.maxTokens ?? 1000

    const genModel = this.gemini.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: options.jsonMode ? "application/json" : "text/plain",
      },
    })

    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    // Gemini expects alternating user/model messages
    const history = geminiMessages.slice(0, -1)
    const lastMessage = geminiMessages[geminiMessages.length - 1]

    const chat = genModel.startChat({ history })
    const result = await chat.sendMessage(lastMessage.parts)

    const response = result.response
    const content = response.text()

    if (!content) throw new Error("No response from Gemini")

    return {
      content,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount,
        completionTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount,
      },
      provider: "gemini",
      model,
    }
  }

  private async callOpenAIVision(
    message: LLMImageMessage,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    }
  ): Promise<LLMResponse> {
    if (!this.openai) throw new Error("OpenAI not initialized")

    const model = options.model || "gpt-4o"
    const temperature = options.temperature ?? 0.3
    const maxTokens = options.maxTokens ?? 1500

    // Convert our message format to OpenAI format
    const content: any[] = []
    for (const part of message.content) {
      if (part.type === "text" && part.text) {
        content.push({ type: "text", text: part.text })
      } else if (part.type === "image_url" && part.image_url) {
        content.push({
          type: "image_url",
          image_url: { url: part.image_url.url }
        })
      }
    }

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) throw new Error("No response from OpenAI Vision")

    return {
      content: responseContent,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
      provider: "openai",
      model,
    }
  }

  private async callGeminiVision(
    message: LLMImageMessage,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      jsonMode?: boolean
    }
  ): Promise<LLMResponse> {
    if (!this.gemini) throw new Error("Gemini not initialized")

    const model = options.model || "gemini-1.5-pro"
    const temperature = options.temperature ?? 0.3
    const maxTokens = options.maxTokens ?? 1500

    const genModel = this.gemini.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: options.jsonMode ? "application/json" : "text/plain",
      },
    })

    // Convert message to Gemini format
    const parts: any[] = []

    for (const content of message.content) {
      if (content.type === "text") {
        parts.push({ text: content.text })
      } else if (content.type === "image_url" && content.image_url) {
        // For Gemini, we need to fetch and convert the image
        try {
          const imageUrl = content.image_url.url
          if (imageUrl.startsWith("data:")) {
            // Handle base64 data URLs
            const [mimeInfo, base64Data] = imageUrl.split(",")
            const mimeType = mimeInfo.split(":")[1].split(";")[0]

            parts.push({
              inlineData: {
                mimeType,
                data: base64Data,
              },
            })
          } else {
            // For regular URLs, we'd need to fetch them
            throw new Error("URL-based images not supported for Gemini vision")
          }
        } catch (error) {
          console.warn("Failed to process image for Gemini:", error)
          continue
        }
      }
    }

    const result = await genModel.generateContent(parts)
    const response = result.response
    const content = response.text()

    if (!content) throw new Error("No response from Gemini Vision")

    return {
      content,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount,
        completionTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount,
      },
      provider: "gemini",
      model,
    }
  }

  // Health check method
  async healthCheck(): Promise<{ [provider: string]: boolean }> {
    const health: { [provider: string]: boolean } = {}

    for (const provider of this.providers) {
      try {
        switch (provider) {
          case "openai":
            if (this.openai) {
              await this.openai.models.list()
              health.openai = true
            } else {
              health.openai = false
            }
            break
          case "gemini":
            if (this.gemini) {
              const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" })
              await model.generateContent("Hello")
              health.gemini = true
            } else {
              health.gemini = false
            }
            break
          default:
            health[provider] = false
        }
      } catch (error) {
        health[provider] = false
      }
    }

    return health
  }
}

// Export singleton instance
export const llmGateway = new LLMGateway()
