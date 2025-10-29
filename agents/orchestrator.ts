import { SizeComplianceAgent } from "./size-compliance"
import { SubjectAdherenceAgent } from "./subject-adherence"
import { CreativityAgent } from "./creativity"
import { MoodConsistencyAgent } from "./mood-consistency"
import { AgentResult, EvaluationData, Evaluation } from "@/types"

export class EvaluationOrchestrator {
  private sizeAgent: SizeComplianceAgent
  private subjectAgent: SubjectAdherenceAgent
  private creativityAgent: CreativityAgent
  private moodAgent: MoodConsistencyAgent

  constructor() {
    this.sizeAgent = new SizeComplianceAgent()
    this.subjectAgent = new SubjectAdherenceAgent()
    this.creativityAgent = new CreativityAgent()
    this.moodAgent = new MoodConsistencyAgent()
  }

  async orchestrateEvaluation(
    data: EvaluationData,
    adminUsername: string
  ): Promise<Omit<Evaluation, "_id" | "createdAt" | "updatedAt">> {
    const startTime = Date.now()

    try {
      // Execute all agents in parallel
      const [
        sizeResult,
        subjectResult,
        creativityResult,
        moodResult,
      ] = await Promise.all([
        this.executeWithTimeout(this.sizeAgent.evaluate(data), 30000),
        this.executeWithTimeout(this.subjectAgent.evaluate(data), 30000),
        this.executeWithTimeout(this.creativityAgent.evaluate(data), 30000),
        this.executeWithTimeout(this.moodAgent.evaluate(data), 30000),
      ])

      // Aggregate scores using weighted average
      const finalScore = this.aggregateScores({
        sizeComplianceAgent: sizeResult,
        subjectAdherenceAgent: subjectResult,
        creativityAgent: creativityResult,
        moodConsistencyAgent: moodResult,
      })

      const totalExecutionTime = Date.now() - startTime

      return {
        promptId: "", // Will be set by the caller
        evaluatedBy: adminUsername,
        evaluatedAt: new Date(),
        agents: {
          sizeComplianceAgent: sizeResult,
          subjectAdherenceAgent: subjectResult,
          creativityAgent: creativityResult,
          moodConsistencyAgent: moodResult,
        },
        finalScore,
        aggregationFormula: "0.20*size + 0.35*subject + 0.25*creativity + 0.20*mood",
        totalExecutionTime,
        status: "completed",
      }
    } catch (error) {
      const totalExecutionTime = Date.now() - startTime

      return {
        promptId: "",
        evaluatedBy: adminUsername,
        evaluatedAt: new Date(),
        agents: {
          sizeComplianceAgent: this.getErrorResult("Size Compliance Agent"),
          subjectAdherenceAgent: this.getErrorResult("Subject Adherence Agent"),
          creativityAgent: this.getErrorResult("Creativity Agent"),
          moodConsistencyAgent: this.getErrorResult("Mood Consistency Agent"),
        },
        finalScore: 0,
        aggregationFormula: "0.20*size + 0.35*subject + 0.25*creativity + 0.20*mood",
        totalExecutionTime,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Agent timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    })

    return Promise.race([promise, timeoutPromise])
  }

  private aggregateScores(agents: {
    sizeComplianceAgent: AgentResult
    subjectAdherenceAgent: AgentResult
    creativityAgent: AgentResult
    moodConsistencyAgent: AgentResult
  }): number {
    const weights = {
      sizeComplianceAgent: 0.20,
      subjectAdherenceAgent: 0.35,
      creativityAgent: 0.25,
      moodConsistencyAgent: 0.20,
    }

    let totalScore = 0
    let totalWeight = 0

    for (const [agentName, result] of Object.entries(agents)) {
      if (result.status === "success") {
        const weight = weights[agentName as keyof typeof weights]
        totalScore += result.score * weight
        totalWeight += weight
      }
    }

    // Normalize if some agents failed
    if (totalWeight === 0) return 0
    return Math.round(totalScore / totalWeight)
  }

  private getErrorResult(agentName: string): AgentResult {
    return {
      score: 0,
      reasoning: `${agentName} failed to execute`,
      executionTime: 0,
      status: "error",
      error: "Agent execution failed",
    }
  }
}

// Export singleton instance
export const evaluationOrchestrator = new EvaluationOrchestrator()
