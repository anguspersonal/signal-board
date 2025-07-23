import { StartupBase, StartupWithCreator, StartupWithRatings } from './startup'

// Transform StartupBase to StartupWithCreator
export function toCreatorStartup(base: StartupBase, name = 'You'): StartupWithCreator {
  return { ...base, creator_name: name }
}

// Transform StartupBase to StartupWithRatings with all required fields
export function toRatedStartup(
  base: StartupBase,
  avg: number,
  name = 'You',
  userRatings: Array<{ id: string; rating: number; comment?: string; user_id: string }> = [],
  saved = false,
  users?: { name: string; email: string }
): StartupWithRatings {
  return { 
    ...base, 
    creator_name: name, 
    avg_rating: avg,
    user_ratings: userRatings,
    saved,
    users
  }
} 