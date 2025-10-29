import { BaseAgent } from "./base-agent"
import { AgentResult, EvaluationData } from "@/types"
import { llmGateway } from "@/lib/llm-gateway"

export class BrandAlignmentAgent extends BaseAgent {
  constructor() {
    super("Brand Alignment Agent")
  }

  async evaluate(data: EvaluationData): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      const prompt = `
You are a brand strategy expert. Evaluate how well this generated image aligns with the brand's core identity, values, and positioning.

**Brand Analysis Required:**

**Brand Identity Assessment:**
1. **Visual Identity (25%)**: How well does the image reflect brand colors, style, and visual language?
2. **Brand Voice & Tone (20%)**: Does the image communicate the brand's personality and voice?
3. **Brand Values (20%)**: Does the image embody the brand's core values and mission?
4. **Target Audience Alignment (15%)**: Is this appropriate for the brand's target demographic?
5. **Market Positioning (20%)**: Does this strengthen the brand's position in its market?

**Content Context:**
- Channel: ${data.channel}
- Original Prompt: "${data.prompt}"
- Brand: ${data.brand.brandName}

**Brand Profile:**
- Style: ${data.brand.style}
- Colors: ${data.brand.colors}
- Vision: ${data.brand.brandVision}
- Voice: ${data.brand.brandVoice}
- Description: ${data.brand.brandDescription}

**Evaluation Focus:**
Analyze whether this image would strengthen or weaken the brand's market position and customer perception. Consider long-term brand equity impact.

Format your response as JSON:
{
  "criteria": {
    "visualIdentity": { "score": number, "reasoning": "string" },
    "brandVoice": { "score": number, "reasoning": "string" },
    "brandValues": { "score": number, "reasoning": "string" },
    "audienceAlignment": { "score": number, "reasoning": "string" },
    "marketPositioning": { "score": number, "reasoning": "string" }
  },
  "overallAlignment": number,
  "brandImpact": "string",
  "recommendations": ["string"],
  "finalScore": number
}
`

      const response = await llmGateway.generateText([
        {
          role: "system",
          content: "You are a senior brand strategist evaluating content alignment. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ], {
        model: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 1200,
        jsonMode: true,
      })

      const evaluation = JSON.parse(response.content)

      return {
        score: evaluation.finalScore,
        reasoning: evaluation.brandImpact,
        executionTime: Date.now() - startTime,
        status: "success",
        details: {
          criteria: evaluation.criteria,
          overallAlignment: evaluation.overallAlignment,
          recommendations: evaluation.recommendations,
          llmResponse: response,
        },
      }
    } catch (error) {
      return {
        score: 0,
        reasoning: `Error evaluating brand alignment: ${error instanceof Error ? error.message : "Unknown error"}`,
        executionTime: Date.now() - startTime,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
