import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"
import { llmGateway } from "@/lib/llm-gateway"
import * as fs from "fs"
import * as path from "path"

export class VisionEvaluatorAgent extends BaseAgent {
  constructor() {
    super("Vision Evaluator Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      // Read the image file
      const imagePath = path.join(process.cwd(), "public", data.imagePath)
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`)
      }

      const imageBuffer = fs.readFileSync(imagePath)
      const base64Image = imageBuffer.toString('base64')
      const mimeType = this.getMimeType(imagePath)

      const prompt = `
You are an expert image evaluator for brand content. Analyze this image based on the following criteria:

**Brand Information:**
- Name: ${data.brand.brandName}
- Style: ${data.brand.style}
- Colors: ${data.brand.colors}
- Vision: ${data.brand.brandVision}
- Voice: ${data.brand.brandVoice}

**Original Prompt:** "${data.prompt}"

**Channel:** ${data.channel}

Please evaluate the image on these aspects:

1. **Visual Brand Alignment (30%)**: How well does the image match the brand's visual style, colors, and aesthetic?

2. **Content Quality (25%)**: Technical quality, composition, lighting, and overall visual appeal?

3. **Subject Accuracy (25%)**: How accurately does the image represent what was requested in the prompt?

4. **Brand Message Communication (20%)**: How effectively does the image communicate the brand's vision and voice?

Provide a detailed analysis with scores for each criterion and an overall assessment.
Format your response as JSON:
{
  "criteria": {
    "visualBrandAlignment": { "score": number, "reasoning": "string" },
    "contentQuality": { "score": number, "reasoning": "string" },
    "subjectAccuracy": { "score": number, "reasoning": "string" },
    "brandMessageCommunication": { "score": number, "reasoning": "string" }
  },
  "overallAssessment": "string",
  "finalScore": number
}
`

      const response = await llmGateway.generateWithVision({
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      }, {
        model: "gpt-4o",
        temperature: 0.3,
        maxTokens: 1500,
        jsonMode: true,
      })

      const evaluation = JSON.parse(response.content)

      // Calculate weighted final score
      const criteria = [
        { weight: 0.3, score: evaluation.criteria.visualBrandAlignment.score },
        { weight: 0.25, score: evaluation.criteria.contentQuality.score },
        { weight: 0.25, score: evaluation.criteria.subjectAccuracy.score },
        { weight: 0.2, score: evaluation.criteria.brandMessageCommunication.score },
      ]

      const finalScore = this.calculateScore(criteria)

      return {
        score: finalScore,
        reasoning: evaluation.overallAssessment,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          criteria: evaluation.criteria,
          visionResponse: response,
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating image with vision: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg'
      case '.png':
        return 'image/png'
      case '.gif':
        return 'image/gif'
      case '.webp':
        return 'image/webp'
      default:
        return 'image/jpeg' // fallback
    }
  }
}
