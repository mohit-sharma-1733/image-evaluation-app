import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"

export class CreativityAgent extends BaseAgent {
  constructor() {
    super("Creativity Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      const promptLower = data.prompt.toLowerCase()
      
      // Analyze different aspects of creativity
      const criteria = []

      // 1. Originality Score (30%)
      const originalityScore = this.assessOriginality(promptLower)
      criteria.push({ weight: 0.3, score: originalityScore })

      // 2. Complexity Score (25%)
      const complexityScore = this.assessComplexity(promptLower, data.metadata)
      criteria.push({ weight: 0.25, score: complexityScore })

      // 3. Artistic Elements Score (25%)
      const artisticScore = this.assessArtisticElements(promptLower)
      criteria.push({ weight: 0.25, score: artisticScore })

      // 4. LLM Model Capability Score (20%)
      const modelScore = this.assessModelCapability(data.llmModel, promptLower)
      criteria.push({ weight: 0.2, score: modelScore })

      const finalScore = this.calculateScore(criteria)

      // Generate detailed reasoning
      let reasoning = this.generateReasoning(
        originalityScore,
        complexityScore,
        artisticScore,
        modelScore,
        data.llmModel
      )

      return {
        score: finalScore,
        reasoning,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          originalityScore,
          complexityScore,
          artisticScore,
          modelScore,
          llmModel: data.llmModel,
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating creativity: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private assessOriginality(prompt: string): number {
    let score = 60 // Base score

    // Check for unique/creative descriptors
    const creativeWords = [
      "unique", "unusual", "extraordinary", "innovative", "creative",
      "imaginative", "original", "distinctive", "unconventional", "artistic",
      "surreal", "abstract", "experimental", "avant-garde", "whimsical",
    ]
    const creativeCount = creativeWords.filter((word) =>
      prompt.includes(word)
    ).length
    score += creativeCount * 8

    // Check for cliché indicators (reduces score)
    const clicheWords = [
      "stock photo", "generic", "typical", "standard", "basic", "simple",
      "plain", "ordinary", "common", "usual", "normal", "regular",
    ]
    const clicheCount = clicheWords.filter((word) => prompt.includes(word)).length
    score -= clicheCount * 10

    // Bonus for unexpected combinations
    const hasUnexpectedCombination = this.detectUnexpectedCombinations(prompt)
    if (hasUnexpectedCombination) score += 15

    return Math.max(0, Math.min(100, score))
  }

  private assessComplexity(prompt: string, metadata?: any): number {
    let score = 50

    // Word count complexity
    const wordCount = prompt.split(/\s+/).length
    if (wordCount > 30) score += 25
    else if (wordCount > 20) score += 20
    else if (wordCount > 10) score += 10
    else if (wordCount < 5) score -= 10

    // Multiple subjects/elements
    const elementCount = this.countElements(prompt)
    score += Math.min(elementCount * 5, 25)

    // Technical specifications
    const hasTechnicalSpecs = this.hasTechnicalSpecifications(prompt)
    if (hasTechnicalSpecs) score += 10

    // Resolution/quality indicators
    if (metadata?.width && metadata.width > 2000) score += 5
    if (prompt.includes("8k") || prompt.includes("4k") || prompt.includes("high resolution")) {
      score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  private assessArtisticElements(prompt: string): number {
    let score = 50

    // Composition mentions
    const compositionTerms = [
      "composition", "framing", "perspective", "angle", "viewpoint",
      "rule of thirds", "symmetry", "balance", "focal point", "depth",
    ]
    const compositionCount = compositionTerms.filter((term) =>
      prompt.includes(term)
    ).length
    score += compositionCount * 10

    // Lighting mentions
    const lightingTerms = [
      "lighting", "light", "shadow", "illumination", "glow", "bright",
      "dark", "contrast", "dramatic lighting", "soft light", "natural light",
      "golden hour", "backlit", "rim light", "ambient",
    ]
    const lightingCount = lightingTerms.filter((term) =>
      prompt.includes(term)
    ).length
    score += lightingCount * 8

    // Color theory
    const colorTheoryTerms = [
      "color palette", "vibrant", "muted", "saturated", "desaturated",
      "warm tones", "cool tones", "complementary colors", "monochrome",
      "color harmony", "gradient", "hue", "tint", "shade",
    ]
    const colorTheoryCount = colorTheoryTerms.filter((term) =>
      prompt.includes(term)
    ).length
    score += colorTheoryCount * 8

    // Artistic style
    const styleTerms = [
      "impressionist", "expressionist", "surrealist", "minimalist",
      "baroque", "renaissance", "modern", "contemporary", "abstract",
      "realistic", "hyperrealistic", "photorealistic", "painterly",
    ]
    const styleCount = styleTerms.filter((term) => prompt.includes(term)).length
    score += styleCount * 7

    return Math.max(0, Math.min(100, score))
  }

  private assessModelCapability(model: string, prompt: string): number {
    // Different models have different strengths
    const modelCapabilities: Record<string, number> = {
      "openai/chatgpt5o": 90,
      "openai/chatgpt-4": 85,
      "google/gemini2.5-pro": 88,
      "google/gemini-pro": 82,
      "anthropic/claude-3": 85,
      "midjourney": 95,
      "stable-diffusion": 80,
      "dall-e-3": 88,
      "deepseek": 75,
    }

    let baseScore = 70
    for (const [key, value] of Object.entries(modelCapabilities)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        baseScore = value
        break
      }
    }

    // Adjust based on prompt complexity vs model capability
    const promptComplexity = prompt.split(/\s+/).length
    if (promptComplexity > 25 && baseScore >= 85) {
      baseScore += 5 // Advanced model handling complex prompt
    } else if (promptComplexity < 10 && baseScore < 80) {
      baseScore -= 5 // Simple prompt doesn't leverage model
    }

    return Math.max(0, Math.min(100, baseScore))
  }

  private detectUnexpectedCombinations(prompt: string): boolean {
    // Look for unusual juxtapositions
    const categories = {
      tech: ["robot", "computer", "digital", "cyber", "futuristic", "ai"],
      nature: ["forest", "ocean", "mountain", "flower", "tree", "natural"],
      vintage: ["vintage", "retro", "old", "antique", "classic", "aged"],
      modern: ["modern", "contemporary", "sleek", "minimalist", "clean"],
    }

    let matchedCategories = 0
    for (const words of Object.values(categories)) {
      if (words.some((word) => prompt.includes(word))) {
        matchedCategories++
      }
    }

    // Unexpected if 2+ different categories are mixed
    return matchedCategories >= 2
  }

  private countElements(prompt: string): number {
    // Count distinct subjects/objects mentioned
    const elements = [
      "person", "people", "man", "woman", "child", "animal", "dog", "cat",
      "bird", "tree", "flower", "building", "house", "car", "vehicle",
      "mountain", "river", "ocean", "sky", "cloud", "sun", "moon", "star",
      "furniture", "table", "chair", "lamp", "book", "computer", "phone",
    ]

    return elements.filter((element) => prompt.includes(element)).length
  }

  private hasTechnicalSpecifications(prompt: string): boolean {
    const techSpecs = [
      "8k", "4k", "hd", "uhd", "resolution", "dpi", "megapixel",
      "iso", "aperture", "shutter", "focal length", "lens",
      "render", "ray tracing", "anti-aliasing", "texture",
    ]
    return techSpecs.some((spec) => prompt.includes(spec))
  }

  private generateReasoning(
    originality: number,
    complexity: number,
    artistic: number,
    model: number,
    modelName: string
  ): string {
    let reasoning = ""

    // Originality assessment
    if (originality >= 80) {
      reasoning += "Highly original and creative concept. "
    } else if (originality >= 60) {
      reasoning += "Moderately creative approach. "
    } else {
      reasoning += "Conventional concept with limited originality. "
    }

    // Complexity assessment
    if (complexity >= 80) {
      reasoning += "Complex composition with multiple elements. "
    } else if (complexity >= 60) {
      reasoning += "Moderate complexity in design. "
    } else {
      reasoning += "Simple, straightforward composition. "
    }

    // Artistic elements
    if (artistic >= 80) {
      reasoning += "Strong artistic direction with attention to visual elements. "
    } else if (artistic >= 60) {
      reasoning += "Some artistic considerations present. "
    } else {
      reasoning += "Limited artistic refinement. "
    }

    // Model capability
    reasoning += `Generated using ${modelName}, `
    if (model >= 85) {
      reasoning += "which is well-suited for this type of creative work."
    } else if (model >= 70) {
      reasoning += "which provides adequate creative capabilities."
    } else {
      reasoning += "which may have limitations for complex creative tasks."
    }

    return reasoning
  }
}
