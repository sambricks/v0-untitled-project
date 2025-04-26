import DatabaseDebug from "@/components/database-debug"

export default function DatabaseDebugPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Database Explorer</h1>
      <p className="text-muted-foreground">View and explore the data in your Supabase database tables.</p>

      <div className="w-full">
        <DatabaseDebug />
      </div>
    </div>
  )
}
