import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"

export class SubjectAdherenceAgent extends BaseAgent {
  constructor() {
    super("Subject Adherence Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      // Extract key elements from prompt
      const promptLower = data.prompt.toLowerCase()
      const keywords = this.extractKeywords(promptLower)
      
      // Analyze prompt complexity
      const wordCount = data.prompt.split(/\s+/).length
      const hasSpecificDetails = this.hasSpecificDetails(promptLower)
      const hasColorMentions = this.hasColorMentions(promptLower)
      const hasStyleMentions = this.hasStyleMentions(promptLower)
      
      // Brand alignment check
      const brandColors = data.brand.colors.toLowerCase()
      const brandStyle = data.brand.style.toLowerCase()
      const brandAlignment = this.checkBrandAlignment(
        promptLower,
        brandColors,
        brandStyle
      )

      // Calculate scores for different criteria
      const criteria = []

      // 1. Prompt Complexity Score (30%)
      let complexityScore = 50
      if (wordCount > 20) complexityScore = 90
      else if (wordCount > 10) complexityScore = 75
      else if (wordCount > 5) complexityScore = 60
      criteria.push({ weight: 0.3, score: complexityScore })

      // 2. Specificity Score (25%)
      let specificityScore = 60
      if (hasSpecificDetails && hasColorMentions && hasStyleMentions) {
        specificityScore = 95
      } else if (hasSpecificDetails && (hasColorMentions || hasStyleMentions)) {
        specificityScore = 80
      } else if (hasSpecificDetails) {
        specificityScore = 70
      }
      criteria.push({ weight: 0.25, score: specificityScore })

      // 3. Brand Alignment Score (35%)
      criteria.push({ weight: 0.35, score: brandAlignment })

      // 4. Coherence Score (10%)
      const coherenceScore = this.checkCoherence(promptLower, keywords)
      criteria.push({ weight: 0.1, score: coherenceScore })

      const finalScore = this.calculateScore(criteria)

      // Generate reasoning
      let reasoning = `Prompt analysis: ${wordCount} words, ${keywords.length} key elements identified. `
      
      if (brandAlignment >= 80) {
        reasoning += `Strong brand alignment detected. `
      } else if (brandAlignment >= 60) {
        reasoning += `Moderate brand alignment. `
      } else {
        reasoning += `Limited brand alignment. `
      }

      if (specificityScore >= 80) {
        reasoning += `Highly specific and detailed prompt. `
      } else if (specificityScore >= 60) {
        reasoning += `Moderately specific prompt. `
      } else {
        reasoning += `Generic prompt with limited details. `
      }

      reasoning += `Expected to match ${data.brand.brandName}'s ${brandStyle} style.`

      return {
        score: finalScore,
        reasoning,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          wordCount,
          keywords: keywords.slice(0, 10),
          hasSpecificDetails,
          hasColorMentions,
          hasStyleMentions,
          brandAlignment,
          complexityScore,
          specificityScore,
          coherenceScore,
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating subject adherence: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful keywords
    const commonWords = new Set([
      "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
      "been", "being", "have", "has", "had", "do", "does", "did", "will",
      "would", "should", "could", "may", "might", "must", "can", "this",
      "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
    ])

    return text
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.has(word))
      .slice(0, 20)
  }

  private hasSpecificDetails(text: string): boolean {
    const detailIndicators = [
      "detailed", "realistic", "professional", "high-quality", "perfect",
      "beautiful", "stunning", "dramatic", "vibrant", "soft", "natural",
      "modern", "vintage", "minimalist", "elegant", "sophisticated",
      "composition", "lighting", "texture", "background", "foreground",
    ]
    return detailIndicators.some((indicator) => text.includes(indicator))
  }

  private hasColorMentions(text: string): boolean {
    const colors = [
      "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
      "black", "white", "gray", "grey", "gold", "silver", "bronze", "beige",
      "cream", "tan", "navy", "teal", "cyan", "magenta", "violet", "indigo",
      "maroon", "olive", "lime", "aqua", "turquoise", "coral", "salmon",
    ]
    return colors.some((color) => text.includes(color))
  }

  private hasStyleMentions(text: string): boolean {
    const styles = [
      "realistic", "abstract", "minimalist", "vintage", "modern", "retro",
      "contemporary", "classic", "artistic", "photographic", "illustrated",
      "painted", "drawn", "sketched", "rendered", "3d", "2d", "flat",
      "detailed", "simple", "complex", "clean", "rustic", "industrial",
      "organic", "geometric", "natural", "artificial", "dramatic", "subtle",
    ]
    return styles.some((style) => text.includes(style))
  }

  private checkBrandAlignment(
    prompt: string,
    brandColors: string,
    brandStyle: string
  ): number {
    let score = 50 // Base score

    // Check color alignment
    const brandColorKeywords = brandColors.toLowerCase().split(/[,\s]+/)
    const colorMatches = brandColorKeywords.filter((color) =>
      prompt.includes(color)
    ).length
    score += colorMatches * 10

    // Check style alignment
    const brandStyleKeywords = brandStyle.toLowerCase().split(/[,\s]+/)
    const styleMatches = brandStyleKeywords.filter((style) =>
      prompt.includes(style)
    ).length
    score += styleMatches * 15

    return Math.min(score, 100)
  }

  private checkCoherence(prompt: string, keywords: string[]): number {
    // Check if keywords are logically related
    const categories = {
      people: ["person", "man", "woman", "child", "people", "human", "face", "portrait"],
      nature: ["tree", "forest", "mountain", "river", "ocean", "sky", "cloud", "flower"],
      objects: ["car", "building", "house", "furniture", "tool", "device", "machine"],
      animals: ["dog", "cat", "bird", "animal", "creature", "wildlife"],
      abstract: ["concept", "idea", "emotion", "feeling", "mood", "atmosphere"],
    }

    let categoryMatches = 0
    for (const category of Object.values(categories)) {
      const matches = keywords.filter((kw) =>
        category.some((word) => kw.includes(word))
      )
      if (matches.length > 0) categoryMatches++
    }

    // More focused prompts (1-2 categories) are more coherent
    if (categoryMatches === 1) return 95
    if (categoryMatches === 2) return 85
    if (categoryMatches === 3) return 70
    return 60
  }
}
