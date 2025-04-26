import { NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: "GROQ_API_KEY is not configured" }, { status: 500 })
    }

    console.log("Testing AI with prompt:", prompt)
    const response = await generateAIResponse(prompt || "Hello, how can you help me with my mental health?")

    return NextResponse.json({
      success: true,
      message: response,
    })
  } catch (error) {
    console.error("AI test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to test AI connection: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Please use POST method with a prompt in the request body" }, { status: 405 })
}
