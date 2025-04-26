"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MoodEntry } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { format, subDays } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function MoodChart() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchMoodData() {
      try {
        console.log("Fetching mood data...")
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(`Auth error: ${userError.message}`)
        }

        if (!user) {
          console.log("No authenticated user found")
          setLoading(false)
          return
        }

        console.log("User authenticated, fetching mood entries...")
        const { data, error: moodError } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7)

        if (moodError) {
          throw new Error(`Database error: ${moodError.message}`)
        }

        console.log(`Fetched ${data?.length || 0} mood entries`)
        setMoodData(data || [])
      } catch (error) {
        console.error("Error fetching mood data:", error)
        setError(`Failed to load mood data: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMoodData()
  }, [supabase])

  // Generate last 7 days for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i)
    return format(date, "MMM dd")
  }).reverse()

  // Map mood data to the last 7 days
  const chartData = last7Days.map((day) => {
    const entry = moodData.find((m) => format(new Date(m.created_at), "MMM dd") === day)
    return {
      day,
      score: entry?.mood_score || 0,
      label: entry?.mood_label || "No data",
    }
  })

  // Calculate average mood if data exists
  const averageMood = moodData.length
    ? (moodData.reduce((sum, entry) => sum + entry.mood_score, 0) / moodData.length).toFixed(1)
    : "N/A"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood History</CardTitle>
        <CardDescription>Your emotional journey over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading mood data...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : moodData.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No mood data yet. Start tracking to see your patterns.</p>
          </div>
        ) : (
          <>
            <div className="h-40 flex items-end justify-between gap-2">
              {chartData.map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-primary rounded-t-md transition-all duration-300"
                    style={{
                      height: `${item.score * 10}%`,
                      opacity: item.score ? 0.6 + item.score / 20 : 0.2,
                    }}
                  />
                  <span className="text-xs mt-2">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Average mood: <span className="font-medium text-foreground">{averageMood}</span>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
