"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function AITest() {
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [prompt, setPrompt] = useState("Hello, how can you help me with my mental health?")

  const testAI = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setResponse(null)

    try {
      console.log("Testing AI connection...")

      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect to AI service")
      }

      setResponse(data.message)
      setSuccess(true)
    } catch (err) {
      console.error("Error testing AI:", err)
      setError(`Failed to connect to AI service: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            Test Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to test the AI"
            rows={3}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">AI connection successful!</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">AI Response:</h3>
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testAI} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test AI Connection"}
        </Button>
      </CardFooter>
    </Card>
  )
}
