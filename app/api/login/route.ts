import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AdminModel from "@/models/Admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Find admin
    const admin = await AdminModel.findOne({ username })
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Create session (simplified - in production use proper session management)
    const response = NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    })

    // Set cookie
    response.cookies.set("admin-session", admin._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    )
  }
}
