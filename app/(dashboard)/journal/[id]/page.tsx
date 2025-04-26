import JournalEditor from "@/components/journal-editor"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditJournalPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: entry, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Journal Entry</h1>
      <p className="text-muted-foreground">Update your thoughts and reflections.</p>

      <div className="max-w-4xl mx-auto">
        <JournalEditor entryId={entry.id} initialTitle={entry.title} initialContent={entry.content} />
      </div>
    </div>
  )
}
