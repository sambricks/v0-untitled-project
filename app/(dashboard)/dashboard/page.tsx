import MoodTracker from "@/components/mood-tracker"
import MoodChart from "@/components/mood-chart"
import ChatInterface from "@/components/chat-interface"
import MusicRecommendations from "@/components/music-recommendations"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Mindi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MoodTracker />
          <MusicRecommendations />
        </div>
        <div className="space-y-6">
          <MoodChart />
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
