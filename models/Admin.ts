import mongoose, { Schema, Model } from "mongoose"
import { Admin } from "@/types"

const AdminSchema = new Schema<Admin>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes are already created by unique: true, no need to duplicate

const AdminModel: Model<Admin> =
  mongoose.models.Admin || mongoose.model<Admin>("Admin", AdminSchema)

export default AdminModel
