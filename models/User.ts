import mongoose, { Schema, Model } from "mongoose"
import { User } from "@/types"

const UserSchema = new Schema<User>(
  {
    userId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true, default: "user" },
  },
  {
    timestamps: true,
  }
)

// Index is already created by unique: true, no need to duplicate

const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema)

export default UserModel
