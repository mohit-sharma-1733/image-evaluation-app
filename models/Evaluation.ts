import mongoose, { Schema, Model } from "mongoose"
import { Evaluation } from "@/types"

const AgentResultSchema = new Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    reasoning: { type: String, required: true },
    executionTime: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["success", "error", "timeout"],
    },
    error: String,
    details: Schema.Types.Mixed,
  },
  { _id: false }
)

const EvaluationSchema = new Schema<Evaluation>(
  {
    promptId: { type: String, required: true },
    evaluatedBy: { type: String, required: true },
    evaluatedAt: { type: Date, required: true, default: Date.now },
    agents: {
      sizeComplianceAgent: { type: AgentResultSchema, required: true },
      subjectAdherenceAgent: { type: AgentResultSchema, required: true },
      creativityAgent: { type: AgentResultSchema, required: true },
      moodConsistencyAgent: { type: AgentResultSchema, required: true },
    },
    finalScore: { type: Number, required: true, min: 0, max: 100 },
    aggregationFormula: { type: String, required: true },
    totalExecutionTime: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    error: String,
  },
  {
    timestamps: true,
  }
)

EvaluationSchema.index({ promptId: 1 })
EvaluationSchema.index({ evaluatedAt: -1 })
EvaluationSchema.index({ finalScore: -1 })
EvaluationSchema.index({ promptId: 1, evaluatedAt: -1 })

const EvaluationModel: Model<Evaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<Evaluation>("Evaluation", EvaluationSchema)

export default EvaluationModel
