"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { MusicRecommendation, MoodEntry } from "@/lib/types"
import { generateMusicSuggestion } from "@/lib/ai"
import { Music, RefreshCw } from "lucide-react"

export default function MusicRecommendations() {
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([])
  const [latestMood, setLatestMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get latest mood
      const { data: moodData, error: moodError } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (moodError) throw moodError

      if (moodData && moodData.length > 0) {
        setLatestMood(moodData[0])
      }

      // Get existing recommendations
      const { data: recData, error: recError } = await supabase
        .from("music_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (recError) throw recError

      if (recData && recData.length > 0) {
        setRecommendations(recData)
      } else if (moodData && moodData.length > 0) {
        // Generate recommendations if we have mood but no recommendations
        generateRecommendations(moodData[0].mood_label)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const generateRecommendations = async (mood: string) => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const suggestions = await generateMusicSuggestion(mood)

      const newRecommendations = suggestions.map((suggestion: any) => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        track_name: suggestion.track_name,
        artist_name: suggestion.artist_name,
        album_name: suggestion.album_name || "",
        spotify_uri: suggestion.spotify_uri || "",
        mood_context: mood,
        created_at: new Date().toISOString(),
      }))

      // Save to database
      const { error } = await supabase.from("music_recommendations").insert(newRecommendations)

      if (error) throw error

      setRecommendations(newRecommendations)
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (latestMood) {
      generateRecommendations(latestMood.mood_label)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Music for Your Mood
        </CardTitle>
        <CardDescription>
          {latestMood
            ? `Recommendations based on your ${latestMood.mood_label.toLowerCase()} mood`
            : "Track your mood to get personalized music recommendations"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Finding the perfect tracks for you...</p>
          </div>
        ) : !latestMood ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Log your mood to get music recommendations</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <Button onClick={handleRefresh}>Generate Recommendations</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="h-12 w-12 bg-primary/20 rounded-md flex items-center justify-center">
                  <Music className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{rec.track_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {rec.artist_name} {rec.album_name ? `• ${rec.album_name}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {recommendations.length > 0 && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleRefresh} disabled={loading || !latestMood}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Recommendations
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
