export interface StartupData {
  id: string
  name: string
  description: string
  user_id: string
}

export interface Startup {
  id: string
  name: string
  description: string
  creator_name: string
  average_score: number
}

export interface StartupRating {
  id: string
  startup_id: string
  dimension: string
  score: number
  created_at: string
} 