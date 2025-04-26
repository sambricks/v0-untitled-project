"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { MoodEntry } from "@/lib/types"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"

export default function InsightsPage() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchMoodData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get mood data for the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

        const { data, error } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true })

        if (error) throw error

        setMoodData(data || [])
      } catch (error) {
        console.error("Error fetching mood data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMoodData()
  }, [supabase])

  // Calculate average mood
  const averageMood = moodData.length
    ? (moodData.reduce((sum, entry) => sum + entry.mood_score, 0) / moodData.length).toFixed(1)
    : "N/A"

  // Calculate mood distribution
  const moodDistribution = moodData.reduce(
    (acc, entry) => {
      const label = entry.mood_label
      acc[label] = (acc[label] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Find most common mood
  let mostCommonMood = "N/A"
  let maxCount = 0

  Object.entries(moodDistribution).forEach(([mood, count]) => {
    if (count > maxCount) {
      mostCommonMood = mood
      maxCount = count
    }
  })

  // Calculate monthly trend
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const monthlyMoods = moodData.filter((entry) => {
    const date = new Date(entry.created_at)
    return date >= monthStart && date <= monthEnd
  })

  const monthlyAverage = monthlyMoods.length
    ? (monthlyMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / monthlyMoods.length).toFixed(1)
    : "N/A"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mood Insights</h1>
      <p className="text-muted-foreground">Analyze your emotional patterns and track your mental health progress.</p>

      {loading ? (
        <p>Loading insights...</p>
      ) : moodData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground">
              No mood data available yet. Start tracking your mood to see insights.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Mood</CardTitle>
              <CardDescription>Your average mood over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{averageMood}</div>
              <p className="text-center text-muted-foreground mt-2">out of 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Common Mood</CardTitle>
              <CardDescription>Your most frequently recorded mood</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{mostCommonMood}</div>
              <p className="text-center text-muted-foreground mt-2">
                {maxCount} time{maxCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Average</CardTitle>
              <CardDescription>Your average mood this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">{monthlyAverage}</div>
              <p className="text-center text-muted-foreground mt-2">{format(now, "MMMM yyyy")}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Breakdown of your recorded moods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(moodDistribution).map(([mood, count]) => (
                  <div key={mood} className="bg-muted rounded-md p-3 flex-1 min-w-[120px]">
                    <p className="font-medium">{mood}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${(count / moodData.length) * 100}%` }}
                      />
                      <span className="text-sm text-muted-foreground ml-2">
                        {Math.round((count / moodData.length) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
