import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import UserModel from "@/models/User"
import BrandModel from "@/models/Brand"
import PromptModel from "@/models/Prompt"
import AdminModel from "@/models/Admin"
import bcrypt from "bcryptjs"
import { getMediaType } from "@/lib/utils"
import sharp from "sharp"
import path from "path"
import fs from "fs"

export async function POST() {
  try {
    await connectDB()

    // Clear existing data
    await UserModel.deleteMany({})
    await BrandModel.deleteMany({})
    await PromptModel.deleteMany({})

    // Seed Users
    const users = [
      {
        userId: "4e234c9f-d31e-4b6a-9a8c-2f7b8d1a3e5c",
        userName: "Donald Duck",
        userRole: "user",
      },
      {
        userId: "8b1d9c7e-f5a6-4b21-8c4d-9e0a3f7b2c1d",
        userName: "Goofy Greyhound",
        userRole: "user",
      },
    ]

    await UserModel.insertMany(users)

    // Seed Brands
    const brands = [
      {
        brandId: "7e9c1a3b-5d7f-40b4-a1c2-3d4e5f6a7b8c",
        brandName: "ChromaBloom Studios",
        brandDescription:
          "An artisan supplier specializing in eco-friendly, high-pigment watercolor paints and unique paper goods. They cater to professional artists and serious hobbyists who value sustainability and depth of color.",
        style:
          "Organic and minimalist. Packaging is recyclable, featuring hand-drawn botanical illustrations and clear, sans-serif typography. The look is clean, earthy, and sophisticated.",
        brandVision:
          "To nurture the artistic process by providing the most vibrant, sustainably-sourced tools, encouraging creators to paint the world a little greener, one brilliant hue at a time.",
        brandVoice:
          'Calm, knowledgeable, and inspirational. Use of evocative language when describing colors (e.g., "Sienna Dusk," "Moss Whisper") and an encouraging, expert tone when offering tips.',
        colors:
          "Deep Forest Green (primary), Cream/Off-White (background), and Rich Ochre/Terracotta (accent).",
      },
      {
        brandId: "5d7f9b1a-3e5c-48a0-8f9e-6c7b8a9d0c1b",
        brandName: "PulseForge Fitness",
        brandDescription:
          "A high-intensity, boutique fitness studio and activewear line focused on dynamic interval training (HIIT) and a 'train smarter, not just harder' philosophy.",
        style:
          "Sleek, aggressive, and tech-forward. Uses bold geometric patterns, metallic textures, and a streamlined, ergonomic look for all apparel and studio design.",
        brandVision:
          "To redefine physical limits by leveraging cutting-edge science and a motivational, community-driven environment, forging both physical and mental resilience in every member.",
        brandVoice:
          'Energizing, challenging, and data-driven. Short, punchy slogans (e.g., "Ignite Your Edge," "The Only Limit is You") mixed with clear, science-backed instruction.',
        colors:
          "Electric Cobalt Blue (primary/pop), Charcoal Grey (base), and Matte Black (core color).",
      },
      {
        brandId: "a9c7b5d3-e1f2-47c8-9d0a-1b2c3d4e5f60",
        brandName: "Æther & Crumb",
        brandDescription:
          "A chain of cozy, modern-gothic bakeries and coffee shops specializing in handcrafted pastries, locally roasted dark-blend coffee, and a quiet, 'third place' atmosphere for work or reading.",
        style:
          "Rustic meets refined gothic. Dark wood, exposed brick, velvet seating, and subtle metallic accents (brass/copper). The logo features an intricate, slightly stylized crescent moon and wheat stalk.",
        brandVision:
          "To be an anchor of comfortable indulgence, a sanctuary where the complexity of life can be savored with a perfect, expertly crafted cup and a moment of sweet solitude.",
        brandVoice:
          "Wry, sophisticated, and comforting. A gentle, old-world charm mixed with modern wit. Focuses on the experience and the ritual of slowing down.",
        colors:
          "Deep Plum/Aubergine (primary), Aged Brass/Gold (accent), and Warm Tan/Cream (for contrast).",
      },
    ]

    await BrandModel.insertMany(brands)

    // Seed Prompts with metadata
    const prompts = [
      {
        imagePath: "sample_images/ChatGPT Image Jul 19, 2025, 11_43_02 AM.png",
        prompt:
          "Two human scientists in a realistic laboratory are arguing over a broken car engine while surrounded by medical equipment and space rockets.",
        llmModel: "openai/chatgpt5o",
        channel: "Instagram",
        userId: "4e234c9f-d31e-4b6a-9a8c-2f7b8d1a3e5c",
        brandId: "7e9c1a3b-5d7f-40b4-a1c2-3d4e5f6a7b8c",
        timestamp: new Date("2025-10-18T11:52:19+07:00"),
        mediaType: "image",
      },
      {
        imagePath: "sample_images/Dramatic and Hopeful Scene at the River Kwai.mp4",
        prompt:
          "A man stands on a long wooden bridge over a river, looking out at a dramatic, colorful sunset as a flock of geese flies through the sky.",
        llmModel: "google/gemini2.5-pro",
        channel: "TikTok",
        userId: "8b1d9c7e-f5a6-4b21-8c4d-9e0a3f7b2c1d",
        brandId: "5d7f9b1a-3e5c-48a0-8f9e-6c7b8a9d0c1b",
        timestamp: new Date("2025-10-25T07:31:01+07:00"),
        mediaType: "video",
      },
      {
        imagePath: "sample_images/old_radio.jpg",
        prompt: "Old wooden vintage radio on white background.",
        llmModel: "openai/chatgpt5o",
        channel: "LinkedIn",
        userId: "8b1d9c7e-f5a6-4b21-8c4d-9e0a3f7b2c1d",
        brandId: "7e9c1a3b-5d7f-40b4-a1c2-3d4e5f6a7b8c",
        timestamp: new Date("2025-10-02T03:09:47+07:00"),
        mediaType: "image",
      },
      {
        imagePath: "sample_images/pointing_squirrel_small.png",
        prompt:
          "Cute squirrel standing and raising one paw, soft lighting, detailed fur, blurred background.",
        llmModel: "deepseek",
        channel: "Instagram",
        userId: "4e234c9f-d31e-4b6a-9a8c-2f7b8d1a3e5c",
        brandId: "7e9c1a3b-5d7f-40b4-a1c2-3d4e5f6a7b8c",
        timestamp: new Date("2025-10-10T16:44:55+07:00"),
        mediaType: "image",
      },
      {
        imagePath:
          "sample_images/Z01932-3611519755-Portrait of {sks woman} with {black} hair and with cute face, {forest}, perfect composition, hyperrealistic, super detailed, 8k,.png",
        prompt:
          "A beautiful East Asian woman with long black hair, looking directly at the viewer, with a soft, natural background of trees and foliage.",
        llmModel: "google/gemini2.5-pro",
        channel: "Facebook",
        userId: "4e234c9f-d31e-4b6a-9a8c-2f7b8d1a3e5c",
        brandId: "a9c7b5d3-e1f2-47c8-9d0a-1b2c3d4e5f60",
        timestamp: new Date("2025-09-30T20:15:33+07:00"),
        mediaType: "image",
      },
    ]

    // Add metadata for images
    const promptsWithMetadata = await Promise.all(
      prompts.map(async (prompt) => {
        if (prompt.mediaType === "image") {
          try {
            const imagePath = path.join(
              process.cwd(),
              "..",
              "mavic-test-repo",
              prompt.imagePath
            )
            
            if (fs.existsSync(imagePath)) {
              const metadata = await sharp(imagePath).metadata()
              return {
                ...prompt,
                metadata: {
                  width: metadata.width,
                  height: metadata.height,
                  format: metadata.format,
                  aspectRatio: metadata.width && metadata.height
                    ? `${(metadata.width / metadata.height).toFixed(2)}:1`
                    : undefined,
                },
              }
            }
          } catch (error) {
            console.log(`Could not read metadata for ${prompt.imagePath}`)
          }
        }
        return prompt
      })
    )

    await PromptModel.insertMany(promptsWithMetadata)

    // Create default admin if doesn't exist
    let adminsCreated = 0
    const existingAdmin = await AdminModel.findOne({ username: "admin" })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10)
      await AdminModel.create({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      })
      adminsCreated = 1
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        users: users.length,
        brands: brands.length,
        prompts: prompts.length,
        admins: adminsCreated,
      },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
