import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"

export class MoodConsistencyAgent extends BaseAgent {
  constructor() {
    super("Mood Consistency Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      const promptLower = data.prompt.toLowerCase()
      const brandVoice = data.brand.brandVoice.toLowerCase()
      const brandVision = data.brand.brandVision.toLowerCase()

      // Define brand mood profiles
      const brandMoodProfile = this.getBrandMoodProfile(data.brand.brandName)

      // Analyze prompt mood
      const promptMood = this.analyzePromptMood(promptLower)

      // Calculate alignment scores
      const criteria = []

      // 1. Emotional Tone Alignment (40%)
      const emotionalScore = this.calculateEmotionalAlignment(
        promptMood,
        brandMoodProfile.emotions
      )
      criteria.push({ weight: 0.4, score: emotionalScore })

      // 2. Brand Voice Alignment (35%)
      const voiceScore = this.calculateVoiceAlignment(promptLower, brandVoice)
      criteria.push({ weight: 0.35, score: voiceScore })

      // 3. Atmosphere Alignment (25%)
      const atmosphereScore = this.calculateAtmosphereAlignment(
        promptLower,
        brandMoodProfile.atmosphere
      )
      criteria.push({ weight: 0.25, score: atmosphereScore })

      const finalScore = this.calculateScore(criteria)

      // Generate reasoning
      const reasoning = this.generateReasoning(
        data.brand.brandName,
        promptMood,
        brandMoodProfile,
        emotionalScore,
        voiceScore,
        atmosphereScore
      )

      return {
        score: finalScore,
        reasoning,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          promptMood,
          brandMoodProfile,
          emotionalScore,
          voiceScore,
          atmosphereScore,
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating mood consistency: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private getBrandMoodProfile(brandName: string): {
    emotions: string[]
    atmosphere: string[]
    keywords: string[]
  } {
    const profiles: Record<
      string,
      { emotions: string[]; atmosphere: string[]; keywords: string[] }
    > = {
      "ChromaBloom Studios": {
        emotions: ["calm", "peaceful", "inspirational", "serene", "gentle"],
        atmosphere: ["organic", "natural", "earthy", "sophisticated", "refined"],
        keywords: [
          "nature", "botanical", "green", "sustainable", "eco-friendly",
          "artistic", "creative", "vibrant", "colorful", "harmonious",
        ],
      },
      "PulseForge Fitness": {
        emotions: ["energetic", "powerful", "motivated", "intense", "dynamic"],
        atmosphere: ["aggressive", "bold", "strong", "athletic", "competitive"],
        keywords: [
          "fitness", "workout", "training", "strength", "power",
          "energy", "motion", "action", "performance", "athletic",
        ],
      },
      "Æther & Crumb": {
        emotions: ["cozy", "comfortable", "nostalgic", "warm", "inviting"],
        atmosphere: ["sophisticated", "refined", "intimate", "rustic", "elegant"],
        keywords: [
          "coffee", "bakery", "artisan", "handcrafted", "vintage",
          "gothic", "dark", "wood", "cozy", "intimate",
        ],
      },
    }

    return (
      profiles[brandName] || {
        emotions: ["neutral", "balanced", "professional"],
        atmosphere: ["modern", "clean", "simple"],
        keywords: ["quality", "professional", "reliable"],
      }
    )
  }

  private analyzePromptMood(prompt: string): {
    emotions: string[]
    atmosphere: string[]
    intensity: number
  } {
    const moodKeywords = {
      calm: ["calm", "peaceful", "serene", "tranquil", "quiet", "gentle", "soft"],
      energetic: ["energetic", "dynamic", "vibrant", "lively", "active", "powerful"],
      cozy: ["cozy", "warm", "comfortable", "inviting", "intimate", "homey"],
      dramatic: ["dramatic", "intense", "bold", "striking", "powerful", "strong"],
      sophisticated: ["sophisticated", "elegant", "refined", "classy", "polished"],
      playful: ["playful", "fun", "whimsical", "cheerful", "lighthearted"],
      mysterious: ["mysterious", "dark", "moody", "enigmatic", "shadowy"],
      nostalgic: ["vintage", "retro", "old", "nostalgic", "classic", "timeless"],
      modern: ["modern", "contemporary", "sleek", "minimalist", "clean"],
      natural: ["natural", "organic", "earthy", "rustic", "raw"],
    }

    const detectedEmotions: string[] = []
    const detectedAtmosphere: string[] = []
    let intensityScore = 50

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const matches = keywords.filter((kw) => prompt.includes(kw))
      if (matches.length > 0) {
        if (["calm", "energetic", "cozy", "dramatic"].includes(mood)) {
          detectedEmotions.push(mood)
        } else {
          detectedAtmosphere.push(mood)
        }
        intensityScore += matches.length * 5
      }
    }

    // Check for intensity modifiers
    const intensityModifiers = [
      "very", "extremely", "highly", "incredibly", "exceptionally",
      "dramatically", "intensely", "strongly", "deeply",
    ]
    const hasIntensityModifiers = intensityModifiers.some((mod) =>
      prompt.includes(mod)
    )
    if (hasIntensityModifiers) intensityScore += 15

    return {
      emotions: detectedEmotions,
      atmosphere: detectedAtmosphere,
      intensity: Math.min(intensityScore, 100),
    }
  }

  private calculateEmotionalAlignment(
    promptMood: { emotions: string[] },
    brandEmotions: string[]
  ): number {
    if (promptMood.emotions.length === 0) return 60 // Neutral

    let matchCount = 0
    let conflictCount = 0

    // Check for matches
    for (const emotion of promptMood.emotions) {
      if (brandEmotions.includes(emotion)) {
        matchCount++
      }
    }

    // Check for conflicts (opposite emotions)
    const conflicts: Record<string, string[]> = {
      calm: ["energetic", "dramatic", "intense"],
      energetic: ["calm", "peaceful", "serene"],
      cozy: ["aggressive", "bold", "intense"],
      dramatic: ["calm", "gentle", "soft"],
    }

    for (const emotion of promptMood.emotions) {
      const conflictingEmotions = conflicts[emotion] || []
      for (const brandEmotion of brandEmotions) {
        if (conflictingEmotions.includes(brandEmotion)) {
          conflictCount++
        }
      }
    }

    let score = 60
    score += matchCount * 20
    score -= conflictCount * 15

    return Math.max(0, Math.min(100, score))
  }

  private calculateVoiceAlignment(prompt: string, brandVoice: string): number {
    // Extract key voice characteristics
    const voiceCharacteristics = brandVoice.split(/[,.\s]+/).filter((w) => w.length > 3)

    let matchCount = 0
    for (const characteristic of voiceCharacteristics) {
      if (prompt.includes(characteristic.toLowerCase())) {
        matchCount++
      }
    }

    // Check for tone indicators
    const toneIndicators = {
      professional: ["professional", "expert", "quality", "premium"],
      casual: ["casual", "friendly", "relaxed", "easy"],
      formal: ["formal", "elegant", "sophisticated", "refined"],
      playful: ["fun", "playful", "creative", "whimsical"],
      serious: ["serious", "important", "significant", "critical"],
    }

    let toneScore = 50
    for (const indicators of Object.values(toneIndicators)) {
      const matches = indicators.filter((ind) => prompt.includes(ind))
      if (matches.length > 0) toneScore += 10
    }

    const baseScore = 50 + matchCount * 15
    return Math.min(100, (baseScore + toneScore) / 2)
  }

  private calculateAtmosphereAlignment(
    prompt: string,
    brandAtmosphere: string[]
  ): number {
    let score = 50

    // Check for atmosphere matches
    for (const atmosphere of brandAtmosphere) {
      if (prompt.includes(atmosphere)) {
        score += 15
      }
    }

    // Check for setting/environment alignment
    const settingKeywords = {
      indoor: ["indoor", "interior", "inside", "room", "studio"],
      outdoor: ["outdoor", "exterior", "outside", "landscape", "nature"],
      urban: ["city", "urban", "street", "building", "downtown"],
      natural: ["nature", "forest", "mountain", "ocean", "wilderness"],
    }

    for (const keywords of Object.values(settingKeywords)) {
      const matches = keywords.filter((kw) => prompt.includes(kw))
      if (matches.length > 0) score += 5
    }

    return Math.max(0, Math.min(100, score))
  }

  private generateReasoning(
    brandName: string,
    promptMood: { emotions: string[]; atmosphere: string[]; intensity: number },
    brandProfile: { emotions: string[]; atmosphere: string[]; keywords: string[] },
    emotionalScore: number,
    voiceScore: number,
    atmosphereScore: number
  ): string {
    let reasoning = `Mood analysis for ${brandName}: `

    // Emotional alignment
    if (emotionalScore >= 80) {
      reasoning += `Strong emotional alignment detected. `
      if (promptMood.emotions.length > 0) {
        reasoning += `Prompt conveys ${promptMood.emotions.join(", ")} mood, matching brand expectations. `
      }
    } else if (emotionalScore >= 60) {
      reasoning += `Moderate emotional alignment. `
    } else {
      reasoning += `Limited emotional alignment with brand. `
      if (promptMood.emotions.length > 0) {
        reasoning += `Prompt mood (${promptMood.emotions.join(", ")}) may not fully align with ${brandProfile.emotions.join(", ")}. `
      }
    }

    // Voice alignment
    if (voiceScore >= 80) {
      reasoning += `Excellent brand voice consistency. `
    } else if (voiceScore >= 60) {
      reasoning += `Acceptable brand voice alignment. `
    } else {
      reasoning += `Brand voice could be stronger. `
    }

    // Atmosphere
    if (atmosphereScore >= 80) {
      reasoning += `Atmosphere perfectly matches brand identity.`
    } else if (atmosphereScore >= 60) {
      reasoning += `Atmosphere is generally consistent with brand.`
    } else {
      reasoning += `Atmosphere may need adjustment to better reflect brand.`
    }

    return reasoning
  }
}
