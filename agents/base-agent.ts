import { AgentResult, EvaluationData } from "@/types"

export abstract class BaseAgent {
  protected name: string

  constructor(name: string) {
    this.name = name
  }

  abstract evaluate(data: EvaluationData): Promise<AgentResult>

  protected async executeWithTimeout(
    promise: Promise<AgentResult>,
    timeoutMs: number = 30000
  ): Promise<AgentResult> {
    const timeoutPromise = new Promise<AgentResult>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(`${this.name} timeout after ${timeoutMs}ms`)
          ),
        timeoutMs
      )
    })

    try {
      return await Promise.race([promise, timeoutPromise])
    } catch (error) {
      return {
        score: 0,
        reasoning: `Agent failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: timeoutMs,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  protected calculateScore(
    criteria: Array<{ weight: number; score: number }>
  ): number {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
    const weightedSum = criteria.reduce(
      (sum, c) => sum + c.weight * c.score,
      0
    )
    return Math.round(weightedSum / totalWeight)
  }
}
