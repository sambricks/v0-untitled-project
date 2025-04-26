export type MoodEntry = {
  id: string
  user_id: string
  mood_score: number
  mood_label: string
  notes?: string
  created_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  title: string
  content: string
  prompt_used?: string
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  user_id: string
  is_user: boolean
  content: string
  created_at: string
}

export type MusicRecommendation = {
  id: string
  user_id: string
  track_name: string
  artist_name: string
  album_name?: string
  spotify_uri?: string
  mood_context?: string
  created_at: string
}

export type UserProfile = {
  id: string
  display_name?: string
  created_at: string
  updated_at: string
}
