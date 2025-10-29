import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import PromptModel from "@/models/Prompt"
import BrandModel from "@/models/Brand"
import EvaluationModel from "@/models/Evaluation"
import { evaluationOrchestrator } from "@/agents/orchestrator"
import { EvaluationData } from "@/types"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get admin from session
    const sessionCookie = request.cookies.get("admin-session")
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { promptId } = body

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: "Prompt ID is required" },
        { status: 400 }
      )
    }

    // Fetch prompt with brand data
    const prompt = await PromptModel.findById(promptId).lean()
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt not found" },
        { status: 404 }
      )
    }

    const brand = await BrandModel.findOne({ brandId: prompt.brandId }).lean()
    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      )
    }

    // Prepare evaluation data
    const evaluationData: EvaluationData = {
      imagePath: prompt.imagePath,
      prompt: prompt.prompt,
      llmModel: prompt.llmModel,
      channel: prompt.channel,
      brand: {
        _id: brand._id.toString(),
        brandId: brand.brandId,
        brandName: brand.brandName,
        brandDescription: brand.brandDescription,
        style: brand.style,
        brandVision: brand.brandVision,
        brandVoice: brand.brandVoice,
        colors: brand.colors,
      },
      metadata: prompt.metadata,
    }

    // Run evaluation
    const evaluation = await evaluationOrchestrator.orchestrateEvaluation(
      evaluationData,
      "admin" // In production, get from session
    )

    // Save evaluation
    const savedEvaluation = await EvaluationModel.create({
      ...evaluation,
      promptId: promptId,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...savedEvaluation.toObject(),
        _id: savedEvaluation._id.toString(),
      },
    })
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Evaluation failed",
      },
      { status: 500 }
    )
  }
}
