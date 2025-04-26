import JournalEditor from "@/components/journal-editor"

export default function NewJournalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Journal Entry</h1>
      <p className="text-muted-foreground">
        Write down your thoughts and feelings to reflect on your mental health journey.
      </p>

      <div className="max-w-4xl mx-auto">
        <JournalEditor />
      </div>
    </div>
  )
}
