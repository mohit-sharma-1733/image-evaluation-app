import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import PromptModel from "@/models/Prompt"
import UserModel from "@/models/User"
import BrandModel from "@/models/Brand"
import EvaluationModel from "@/models/Evaluation"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth()
    
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const _id = searchParams.get("_id")
    const channel = searchParams.get("channel")
    const brandId = searchParams.get("brandId")
    const sortBy = searchParams.get("sortBy") || "date"
    const order = searchParams.get("order") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Build query
    const query: any = {}
    if (_id) query._id = _id
    if (channel) query.channel = channel
    if (brandId) query.brandId = brandId

    // Build sort
    const sort: any = {}
    if (sortBy === "date") {
      sort.timestamp = order === "asc" ? 1 : -1
    } else if (sortBy === "score") {
      // For score sorting, we'll need to aggregate with evaluations
      // This is handled differently below
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    let prompts = await PromptModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await PromptModel.countDocuments(query)

    // Populate user and brand data
    let promptsWithData = await Promise.all(
      prompts.map(async (prompt) => {
        const user = await UserModel.findOne({ userId: prompt.userId }).lean()
        const brand = await BrandModel.findOne({
          brandId: prompt.brandId,
        }).lean()
        
        // Get latest evaluation if exists
        const evaluation = await EvaluationModel.findOne({
          promptId: prompt._id.toString(),
        })
          .sort({ evaluatedAt: -1 })
          .lean()

        return {
          ...prompt,
          _id: prompt._id.toString(),
          user,
          brand,
          evaluation: evaluation
            ? {
                ...evaluation,
                _id: evaluation._id.toString(),
              }
            : null,
        }
      })
    )

    // Sort by score if requested
    if (sortBy === "score") {
      promptsWithData.sort((a, b) => {
        const scoreA = a.evaluation?.finalScore ?? -1
        const scoreB = b.evaluation?.finalScore ?? -1
        return order === "asc" ? scoreA - scoreB : scoreB - scoreA
      })
    }

    return NextResponse.json({
      success: true,
      data: promptsWithData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get prompts error:", error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login.",
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch prompts",
      },
      { status: 500 }
    )
  }
}
