"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { JournalEntry } from "@/lib/types"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchJournalEntries() {
      try {
        console.log("Fetching journal entries...")
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

        console.log("User authenticated, fetching journal entries...")
        const { data, error: journalError } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (journalError) {
          throw new Error(`Database error: ${journalError.message}`)
        }

        console.log(`Fetched ${data?.length || 0} journal entries`)
        setEntries(data || [])
      } catch (error) {
        console.error("Error fetching journal entries:", error)
        setError(`Failed to load journal entries: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJournalEntries()
  }, [supabase])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) return

      const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      setEntries(entries.filter((entry) => entry.id !== id))
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      alert(`Failed to delete entry: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Journal Entries</h2>
        <Button onClick={() => router.push("/journal/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-6">
            <p>Loading journal entries...</p>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">No journal entries yet</p>
            <Button onClick={() => router.push("/journal/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle>{entry.title}</CardTitle>
                <CardDescription>{format(new Date(entry.created_at), "MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{entry.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/journal/${entry.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
