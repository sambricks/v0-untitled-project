"use client"

import type React from "react"
import { ensureUserProfileExists } from "@/lib/db/profiles";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const moodLabels = [
  { score: 1, label: "Terrible", emoji: "😭" },
  { score: 2, label: "Bad", emoji: "😢" },
  { score: 3, label: "Sad", emoji: "😔" },
  { score: 4, label: "Meh", emoji: "😐" },
  { score: 5, label: "Okay", emoji: "🙂" },
  { score: 6, label: "Good", emoji: "😊" },
  { score: 7, label: "Great", emoji: "😁" },
  { score: 8, label: "Excellent", emoji: "🥳" },
  { score: 9, label: "Amazing", emoji: "😍" },
  { score: 10, label: "Euphoric", emoji: "🤩" },
]

export default function MoodTracker() {
  const [moodScore, setMoodScore] = useState(5)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const currentMood = moodLabels.find((m) => m.score === moodScore)

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    console.log("Saving mood entry...");
    
    // First ensure the user profile exists
    const userId = await ensureUserProfileExists();
    
    console.log("User profile checked, saving mood entry...");
    const moodEntry = {
      user_id: userId,
      mood_score: moodScore,
      mood_label: currentMood?.label || "",
      notes: notes.trim() || null,
    };

    console.log("Mood entry data:", moodEntry);
    const { error: insertError, data } = await supabase.from("mood_entries").insert(moodEntry).select();

    if (insertError) throw insertError;

    console.log("Mood entry saved successfully:", data);
    setNotes("");
    setSuccess(true);

    // Force a refresh to update the mood chart
    setTimeout(() => {
      router.refresh();
    }, 1000);
  } catch (error) {
    console.error("Error saving mood:", error);
    // Properly extract the error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Unknown error occurred';
    setError(`Failed to save mood: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Track your mood to help understand your emotional patterns</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Mood saved successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <span className="text-6xl">{currentMood?.emoji}</span>
              <p className="text-xl font-medium mt-2">{currentMood?.label}</p>
            </div>
            <Slider
              value={[moodScore]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setMoodScore(value[0])}
              className="mt-6"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>😭</span>
              <span>🤩</span>
            </div>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add notes about how you're feeling (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Mood"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
