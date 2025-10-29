import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"

export class SizeComplianceAgent extends BaseAgent {
  constructor() {
    super("Size Compliance Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      // Standard social media sizes
      const standardSizes: Record<
        string,
        { width: number; height: number; tolerance: number }
      > = {
        Instagram: { width: 1080, height: 1080, tolerance: 0.1 }, // Square
        TikTok: { width: 1080, height: 1920, tolerance: 0.1 }, // 9:16
        LinkedIn: { width: 1200, height: 627, tolerance: 0.1 }, // ~1.91:1
        Facebook: { width: 1200, height: 630, tolerance: 0.1 }, // ~1.91:1
      }

      const expectedSize = standardSizes[data.channel] || {
        width: 1200,
        height: 1200,
        tolerance: 0.15,
      }

      // Get actual dimensions from metadata
      const actualWidth = data.metadata?.width || 0
      const actualHeight = data.metadata?.height || 0

      if (!actualWidth || !actualHeight) {
        return {
          score: 50,
          reasoning:
            "Unable to determine image dimensions. Metadata not available.",
          executionTime: Date.now() - startTime,
          status: "success",
          details: {
            expected: expectedSize,
            actual: { width: actualWidth, height: actualHeight },
          },
        }
      }

      // Calculate aspect ratio compliance
      const expectedRatio = expectedSize.width / expectedSize.height
      const actualRatio = actualWidth / actualHeight
      const ratioDeviation = Math.abs(expectedRatio - actualRatio) / expectedRatio

      // Calculate dimension compliance
      const widthDeviation =
        Math.abs(actualWidth - expectedSize.width) / expectedSize.width
      const heightDeviation =
        Math.abs(actualHeight - expectedSize.height) / expectedSize.height
      const avgDeviation = (widthDeviation + heightDeviation) / 2

      // Scoring logic
      let score = 100
      let reasoning = ""

      if (ratioDeviation <= 0.05) {
        // Perfect aspect ratio
        score = 100
        reasoning = `Perfect aspect ratio match for ${data.channel}. `
      } else if (ratioDeviation <= 0.15) {
        // Good aspect ratio
        score = 90
        reasoning = `Good aspect ratio for ${data.channel}. `
      } else if (ratioDeviation <= 0.3) {
        // Acceptable
        score = 75
        reasoning = `Acceptable aspect ratio for ${data.channel}. `
      } else {
        // Poor aspect ratio
        score = 50
        reasoning = `Aspect ratio deviates significantly from ${data.channel} standards. `
      }

      // Adjust for absolute size
      if (avgDeviation <= expectedSize.tolerance) {
        reasoning += `Dimensions are within acceptable range.`
      } else if (avgDeviation <= 0.25) {
        score = Math.max(score - 10, 0)
        reasoning += `Dimensions are slightly off from optimal size.`
      } else {
        score = Math.max(score - 20, 0)
        reasoning += `Dimensions differ significantly from optimal size.`
      }

      // Bonus for high resolution
      if (actualWidth >= expectedSize.width && actualHeight >= expectedSize.height) {
        score = Math.min(score + 5, 100)
        reasoning += ` High resolution detected.`
      }

      return {
        score: Math.round(score),
        reasoning: `${reasoning} Actual: ${actualWidth}x${actualHeight}, Expected: ${expectedSize.width}x${expectedSize.height} for ${data.channel}.`,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          expected: expectedSize,
          actual: { width: actualWidth, height: actualHeight },
          ratioDeviation: ratioDeviation.toFixed(3),
          avgDeviation: avgDeviation.toFixed(3),
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating size compliance: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
