import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Please add credentials to .env file" },
        { status: 500 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB` },
          { status: 400 }
        )
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File ${file.name} has invalid type. Only JPEG, PNG, and WebP are allowed` },
          { status: 400 }
        )
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "appareldesk/products",
            resource_type: "image",
            transformation: [
              { width: 1000, height: 1000, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      uploadedUrls.push(result.secure_url)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}
