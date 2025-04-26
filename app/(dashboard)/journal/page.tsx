import JournalList from "@/components/journal-list"

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Journal</h1>
      <p className="text-muted-foreground">
        Record your thoughts, feelings, and experiences to track your mental health journey.
      </p>

      <JournalList />
    </div>
  )
}
