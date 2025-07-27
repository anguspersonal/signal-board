// Rating dimensions for the Hally Six-Dimensional Framework
export const RATING_DIMENSIONS = {
    'market-demand': 'Market & Demand',
    'solution-execution': 'Solution & Execution', 
    'team-founders': 'Team & Founders',
    'business-model': 'Business-Model Viability',
    'validation-traction': 'Validation & Traction',
    'environment-runway': 'Environment & Runway'
  } as const
  
  export type RatingDimension = keyof typeof RATING_DIMENSIONS
  
  // Represents the raw database row from the `startups` table
  export interface StartupBase {
    id: string
    user_id: string
    name: string
    summary?: string
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
      dimension: string
      score: number
      comment?: string
      user_id: string
      visibility?: 'public' | 'private' | 'inner-circle'
    }>
    dimension_ratings?: {
      [dimension: string]: {
        avg: number
        count: number
      }
    }
    saved?: boolean
    interested?: boolean
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
    visibility: 'public' | 'private' | 'inner-circle'
  } 
  
  export interface StartupAccess {
    startup_id: string
    user_id: string
    role: 'viewer' | 'commenter' | 'editor'
  }
  
  export type StartupAccessRole = 'viewer' | 'commenter' | 'editor' 