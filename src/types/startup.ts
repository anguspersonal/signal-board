// Represents the raw database row from the `startups` table
export interface StartupBase {
  id: string
  user_id: string
  name: string
  description: string
  tags?: string[]
  logo_url?: string
  visibility: 'public' | 'invite-only' | 'private'
  created_at: string
  status?: string
  asks_and_opportunities?: string
  website_url?: string
}

// Adds the startup creator's display name (joined from users)
export interface StartupWithCreator extends StartupBase {
  creator_name: string
}

// Enriched shape for client rendering (ratings, interactivity)
export interface StartupWithRatings extends StartupWithCreator {
  avg_rating?: number
  user_ratings?: Array<{
    id: string
    rating: number
    comment?: string
    user_id: string
  }>
  saved?: boolean
  users?: { name: string; email: string }
}

export interface StartupRating {
  id: string
  startup_id: string
  user_id: string
  dimension: string
  score: number
  comment?: string
  created_at: string
} 