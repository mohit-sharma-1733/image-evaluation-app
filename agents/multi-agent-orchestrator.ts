import { AgentResult, EvaluationData, Evaluation } from "@/types"
import { llmGateway } from "@/lib/llm-gateway"
import { BrandAlignmentAgent } from "./brand-alignment"
import { SizeComplianceAgent } from "./size-compliance"
import { ContentQualityLLMAgent } from "./subject-adherence-llm"
import { CreativityAgent } from "./creativity"
import { MoodConsistencyAgent } from "./mood-consistency"

// Initialize agents - exactly 4 core agents as requested
const brandAgent = new BrandAlignmentAgent()
const sizeAgent = new SizeComplianceAgent()
const contentQualityAgent = new ContentQualityLLMAgent()
const creativityAgent = new CreativityAgent()
const moodAgent = new MoodConsistencyAgent()

export class MultiAgentOrchestrator {
  async orchestrateEvaluation(
    data: EvaluationData,
    adminUsername: string
  ): Promise<Omit<Evaluation, "_id" | "createdAt" | "updatedAt">> {
    console.log("Starting multi-agent evaluation...")

    const startTime = Date.now()

    try {
      // Step 1: Brand alignment assessment (runs first, provides context)
      console.log("Step 1: Evaluating brand alignment...")
      const brandResult = await brandAgent.evaluate(data)

      // Create enhanced data with brand context
      const enhancedData = {
        ...data,
        brandContext: {
          alignmentScore: brandResult.score,
          alignmentReasoning: brandResult.reasoning,
          recommendations: brandResult.details?.recommendations || []
        }
      }

      // Step 2: Execute 4 core agents in parallel with brand context
      console.log("Step 2: Running core evaluation agents with brand context...")
      const [
        sizeResult,
        contentResult,
        creativityResult,
        moodResult,
      ] = await Promise.all([
        sizeAgent.evaluate(enhancedData).catch((error: any) => ({
          score: 0,
          reasoning: `Size compliance evaluation failed: ${error.message}`,
          executionTime: Date.now() - startTime,
          status: "error" as const,
          error: error.message,
        })),
        contentQualityAgent.evaluate(enhancedData).catch((error: any) => ({
          score: 0,
          reasoning: `Content quality evaluation failed: ${error.message}`,
          executionTime: Date.now() - startTime,
          status: "error" as const,
          error: error.message,
        })),
        creativityAgent.evaluate(enhancedData).catch((error: any) => ({
          score: 0,
          reasoning: `Creativity evaluation failed: ${error.message}`,
          executionTime: Date.now() - startTime,
          status: "error" as const,
          error: error.message,
        })),
        moodAgent.evaluate(enhancedData).catch((error: any) => ({
          score: 0,
          reasoning: `Mood consistency evaluation failed: ${error.message}`,
          executionTime: Date.now() - startTime,
          status: "error" as const,
          error: error.message,
        })),
      ])

      console.log("All agents completed. Starting coordination...")

      // Use LLM to coordinate and provide final assessment
      const coordinationPrompt = `
You are an evaluation coordinator. Review all the agent results and determine how well the generated image serves the brand's objectives and creates value.

Brand: ${data.brand.brandName}
Channel: ${data.channel}
Original Prompt: "${data.prompt}"

**Brand Context (from Brand Alignment Agent):**
${brandResult.score}/100 - ${brandResult.reasoning}

**Core Agent Results:**
- Size Compliance: ${sizeResult.score}/100 - ${sizeResult.reasoning}
- Content Quality: ${contentResult.score}/100 - ${contentResult.reasoning}
- Creativity: ${creativityResult.score}/100 - ${creativityResult.reasoning}
- Mood Consistency: ${moodResult.score}/100 - ${moodResult.reasoning}

**Evaluation Task:**
Based on the brand alignment assessment and the 4 core evaluations, determine:
1. How well does this image match what the brand is asking for?
2. Does it create value for the brand (engagement, perception, positioning)?
3. What is the overall effectiveness for the brand's goals?

Consider the brand's vision, voice, target audience, and market positioning when calculating the final score.

Format your response as JSON:
{
  "finalScore": number,
  "reasoning": "string",
  "brandValue": "string",
  "recommendations": ["string"]
}
`

      const coordinationResponse = await llmGateway.generateText([
        {
          role: "system",
          content: "You are an expert at coordinating multi-agent evaluations for brand content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: coordinationPrompt
        }
      ], {
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 1000,
        jsonMode: true,
      })

      const coordination = JSON.parse(coordinationResponse.content)

      const totalExecutionTime = Date.now() - startTime

      return {
        promptId: "", // Will be set by caller
        evaluatedBy: adminUsername,
        evaluatedAt: new Date(),
        agents: {
          sizeComplianceAgent: sizeResult,
          subjectAdherenceAgent: contentResult, // Content Quality Agent
          creativityAgent: creativityResult,
          moodConsistencyAgent: moodResult,
        },
        finalScore: coordination.finalScore,
        aggregationFormula: "Brand-first multi-agent evaluation with 4 core agents",
        totalExecutionTime,
        status: "completed",
      }
    } catch (error) {
      console.error("Multi-agent evaluation failed:", error)

      // Fallback to simple evaluation
      const [
        sizeResult,
        contentResult,
        creativityResult,
        moodResult,
      ] = await Promise.all([
        sizeAgent.evaluate(data),
        contentQualityAgent.evaluate(data),
        creativityAgent.evaluate(data),
        moodAgent.evaluate(data),
      ])

      const finalScore = Math.round(
        (sizeResult.score * 0.25) +
        (contentResult.score * 0.40) +
        (creativityResult.score * 0.20) +
        (moodResult.score * 0.15)
      )

      return {
        promptId: "",
        evaluatedBy: adminUsername,
        evaluatedAt: new Date(),
        agents: {
          sizeComplianceAgent: sizeResult,
          subjectAdherenceAgent: contentResult, // Content Quality Agent
          creativityAgent: creativityResult,
          moodConsistencyAgent: moodResult,
        },
        finalScore,
        aggregationFormula: "Fallback evaluation due to multi-agent failure",
        totalExecutionTime: Date.now() - startTime,
        status: "completed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Export singleton instance
export const multiAgentOrchestrator = new MultiAgentOrchestrator()
