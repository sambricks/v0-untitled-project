import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Helper function to check if Groq API key is configured
function isGroqConfigured() {
  return !!process.env.GROQ_API_KEY
}

// Function to generate AI responses
export async function generateAIResponse(prompt: string, context?: string) {
  try {
    // Check if Groq is configured
    if (!isGroqConfigured()) {
      console.error("GROQ_API_KEY is not configured")
      return "AI service is not properly configured. Please check your environment variables."
    }

    console.log("Generating AI response with Groq...")

    const systemPrompt = `You are a compassionate mental health companion named Mindi. 
    Your goal is to provide supportive, empathetic responses to help users manage their mental wellbeing.
    You should be warm, understanding, and never judgmental. 
    Provide practical advice when appropriate, but focus on emotional support.
    Keep responses concise (under 150 words) but meaningful.
    ${context ? `Context about the user: ${context}` : ""}`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      system: systemPrompt,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    return `I'm having trouble connecting right now. Error: ${error instanceof Error ? error.message : String(error)}`
  }
}

// Function to generate journal prompts
export async function generateJournalPrompt(mood?: string) {
  try {
    // Check if Groq is configured
    if (!isGroqConfigured()) {
      console.error("GROQ_API_KEY is not configured")
      return "What's on your mind today? (AI service not configured)"
    }

    console.log("Generating journal prompt with Groq...")

    const prompt = `Generate a thoughtful journaling prompt for someone who is feeling ${mood || "reflective"} today. The prompt should encourage self-reflection and emotional processing.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      maxTokens: 100,
    })

    return text
  } catch (error) {
    console.error("Error generating journal prompt:", error)
    return `What emotions are you experiencing today? (Error: ${error instanceof Error ? error.message : String(error)})`
  }
}

// Function to generate music recommendations based on mood
export async function generateMusicSuggestion(mood: string) {
  try {
    // Check if Groq is configured
    if (!isGroqConfigured()) {
      console.error("GROQ_API_KEY is not configured")
      return [
        { track_name: "Weightless", artist_name: "Marconi Union", album_name: "Weightless" },
        { track_name: "Electra", artist_name: "Airstream", album_name: "Electra" },
        { track_name: "Watermark", artist_name: "Enya", album_name: "Watermark" },
      ]
    }

    console.log("Generating music suggestions with Groq...")

    const prompt = `Suggest 3 songs that would be good for someone feeling ${mood}. Format the response as a JSON array with objects containing track_name, artist_name, and album_name properties. Do not include any explanatory text.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      system:
        "You are a music recommendation assistant. Respond only with valid JSON arrays containing song recommendations.",
      maxTokens: 300,
    })

    console.log("Raw AI response:", text)

    // Extract JSON from response
    const jsonMatch = text.match(/\[.*\]/s)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error("Error parsing JSON from AI response:", parseError)
        console.log("Failed to parse:", jsonMatch[0])
      }
    }

    // Fallback if JSON parsing fails
    return [
      { track_name: "Weightless", artist_name: "Marconi Union", album_name: "Weightless" },
      { track_name: "Electra", artist_name: "Airstream", album_name: "Electra" },
      { track_name: "Watermark", artist_name: "Enya", album_name: "Watermark" },
    ]
  } catch (error) {
    console.error("Error generating music suggestions:", error)
    return [
      { track_name: "Weightless", artist_name: "Marconi Union", album_name: "Weightless" },
      { track_name: "Electra", artist_name: "Airstream", album_name: "Electra" },
      { track_name: "Watermark", artist_name: "Enya", album_name: "Watermark" },
    ]
  }
}
