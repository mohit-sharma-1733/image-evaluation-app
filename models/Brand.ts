import mongoose, { Schema, Model } from "mongoose"
import { Brand } from "@/types"

const BrandSchema = new Schema<Brand>(
  {
    brandId: { type: String, required: true, unique: true },
    brandName: { type: String, required: true },
    brandDescription: { type: String, required: true },
    style: { type: String, required: true },
    brandVision: { type: String, required: true },
    brandVoice: { type: String, required: true },
    colors: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

// Index is already created by unique: true, no need to duplicate

const BrandModel: Model<Brand> =
  mongoose.models.Brand || mongoose.model<Brand>("Brand", BrandSchema)

export default BrandModel
