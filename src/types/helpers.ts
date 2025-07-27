import { StartupBase, StartupWithCreator, StartupWithRatings } from './startups'

// Transform StartupBase to StartupWithCreator
export function toCreatorStartup(base: StartupBase, name = 'You'): StartupWithCreator {
  return { ...base, creator_name: name }
}

// Transform StartupBase to StartupWithRatings with all required fields
export function toRatedStartup(
  base: StartupBase,
  avg: number,
  name = 'You',
  userRatings: Array<{ id: string; dimension: string; score: number; comment?: string; user_id: string }> = [],
  dimensionRatings?: { [dimension: string]: { avg: number; count: number } },
  saved = false,
  interested = false,
  users?: { name: string; email: string }
): StartupWithRatings {
  return { 
    ...base, 
    creator_name: name, 
    avg_rating: avg,
    user_ratings: userRatings,
    dimension_ratings: dimensionRatings,
    saved,
    interested,
    users
  }
} 