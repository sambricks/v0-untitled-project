import MusicRecommendations from "@/components/music-recommendations"

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Music Therapy</h1>
      <p className="text-muted-foreground">
        Discover music recommendations tailored to your emotional state to help improve your mood.
      </p>

      <div className="max-w-4xl mx-auto">
        <MusicRecommendations />
      </div>
    </div>
  )
}
