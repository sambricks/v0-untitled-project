"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function DebugPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "success" | "error">("loading")
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [groqStatus, setGroqStatus] = useState<"loading" | "success" | "error">("loading")
  const [groqError, setGroqError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Test Supabase connection
    async function testSupabase() {
      try {
        const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

        if (error) throw error

        setSupabaseStatus("success")
      } catch (error) {
        console.error("Supabase connection error:", error)
        setSupabaseStatus("error")
        setSupabaseError(`${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Test Groq connection
    async function testGroq() {
      try {
        const res = await fetch("/api/ai/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: "Hello" }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to connect to AI service")
        }

        setGroqStatus("success")
      } catch (error) {
        console.error("Groq connection error:", error)
        setGroqStatus("error")
        setGroqError(`${error instanceof Error ? error.message : String(error)}`)
      }
    }

    testSupabase()
    testGroq()
  }, [supabase])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Diagnostics</h1>
      <p className="text-muted-foreground">Check the status of your connections and environment variables.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
            <CardDescription>Check if your app can connect to Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            {supabaseStatus === "loading" ? (
              <p>Testing connection...</p>
            ) : supabaseStatus === "success" ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">Successfully connected to Supabase</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Connection failed: {supabaseError}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => {
                setSupabaseStatus("loading")
                setSupabaseError(null)

                async function testSupabase() {
                  try {
                    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

                    if (error) throw error

                    setSupabaseStatus("success")
                  } catch (error) {
                    console.error("Supabase connection error:", error)
                    setSupabaseStatus("error")
                    setSupabaseError(`${error instanceof Error ? error.message : String(error)}`)
                  }
                }

                testSupabase()
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Test Again
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groq AI Connection</CardTitle>
            <CardDescription>Check if your app can connect to Groq AI</CardDescription>
          </CardHeader>
          <CardContent>
            {groqStatus === "loading" ? (
              <p>Testing connection...</p>
            ) : groqStatus === "success" ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">Successfully connected to Groq AI</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Connection failed: {groqError}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => {
                setGroqStatus("loading")
                setGroqError(null)

                async function testGroq() {
                  try {
                    const res = await fetch("/api/ai/test", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ prompt: "Hello" }),
                    })

                    const data = await res.json()

                    if (!res.ok) {
                      throw new Error(data.error || "Failed to connect to AI service")
                    }

                    setGroqStatus("success")
                  } catch (error) {
                    console.error("Groq connection error:", error)
                    setGroqStatus("error")
                    setGroqError(`${error instanceof Error ? error.message : String(error)}`)
                  }
                }

                testGroq()
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Test Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
