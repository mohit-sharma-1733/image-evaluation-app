import mongoose, { Schema, Model } from "mongoose"
import { Prompt } from "@/types"

const PromptSchema = new Schema<Prompt>(
  {
    imagePath: { type: String, required: true },
    prompt: { type: String, required: true },
    llmModel: { type: String, required: true },
    channel: {
      type: String,
      required: true,
      enum: ["Instagram", "TikTok", "LinkedIn", "Facebook"],
    },
    userId: { type: String, required: true },
    brandId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    mediaType: {
      type: String,
      required: true,
      enum: ["image", "video"],
      default: "image",
    },
    metadata: {
      width: Number,
      height: Number,
      fileSize: Number,
      duration: Number,
      format: String,
      aspectRatio: String,
    },
  },
  {
    timestamps: true,
  }
)

PromptSchema.index({ timestamp: -1 })
PromptSchema.index({ channel: 1 })
PromptSchema.index({ brandId: 1 })
PromptSchema.index({ userId: 1 })
PromptSchema.index({ channel: 1, timestamp: -1 })

const PromptModel: Model<Prompt> =
  mongoose.models.Prompt || mongoose.model<Prompt>("Prompt", PromptSchema)

export default PromptModel
