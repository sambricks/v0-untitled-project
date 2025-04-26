"use client"

import type React from "react"
import { ensureUserProfileExists } from "@/lib/db/profiles";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { generateJournalPrompt } from "@/lib/ai"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface JournalEditorProps {
  entryId?: string
  initialTitle?: string
  initialContent?: string
}

export default function JournalEditor({ entryId, initialTitle = "", initialContent = "" }: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const isEditing = !!entryId

  // Generate a journal prompt on component mount if creating a new entry
  useEffect(() => {
    if (!isEditing) {
      fetchJournalPrompt()
    }
  }, [isEditing])

  const fetchJournalPrompt = async () => {
    setPromptLoading(true)
    try {
      console.log("Generating journal prompt...")
      const newPrompt = await generateJournalPrompt()
      console.log("Journal prompt generated:", newPrompt)
      setPrompt(newPrompt)
    } catch (error) {
      console.error("Error generating journal prompt:", error)
      setPrompt("What are you thinking about today?")
    } finally {
      setPromptLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!title.trim() || !content.trim() || loading) return;

  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    console.log(`${isEditing ? "Updating" : "Creating"} journal entry...`);
    
    // First ensure the user profile exists
    const userId = await ensureUserProfileExists();

    if (isEditing) {
      // Update existing entry
      console.log("Updating journal entry:", entryId);
      const { error: updateError, data } = await supabase
        .from("journal_entries")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .eq("user_id", userId)
        .select();

      if (updateError) throw new Error(`Database error: ${updateError.message}`);
      console.log("Journal entry updated successfully:", data);
    } else {
      // Create new entry
      console.log("Creating new journal entry");
      const journalEntry = {
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
        prompt_used: prompt,
      };

      console.log("Journal entry data:", journalEntry);
      const { error: insertError, data } = await supabase.from("journal_entries").insert(journalEntry).select();

      if (insertError) throw new Error(`Database error: ${insertError.message}`);
      console.log("Journal entry created successfully:", data);
    }

    setSuccess(true);

    // Navigate back to journal list after a short delay
    setTimeout(() => {
      router.push("/journal");
      router.refresh();
    }, 1000);
  } catch (error) {
    console.error("Error saving journal entry:", error);
    setError(`Failed to save journal entry: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Journal Entry" : "New Journal Entry"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Journal entry {isEditing ? "updated" : "created"} successfully!
              </AlertDescription>
            </Alert>
          )}

          {!isEditing && (
            <div className="bg-muted p-3 rounded-md flex justify-between items-start">
              <p className="text-sm italic">{promptLoading ? "Loading prompt..." : prompt}</p>
              <Button type="button" variant="ghost" size="sm" onClick={fetchJournalPrompt} disabled={promptLoading}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">New prompt</span>
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="resize-none"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/journal")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
