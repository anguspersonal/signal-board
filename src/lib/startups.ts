import { createClient } from './supabase'
import { StartupWithCreator, StartupBase, StartupWithRatings } from '@/types/startup'
import { toCreatorStartup, toRatedStartup } from '@/types/helpers'
import { logger } from './logger'

// Helper function to fetch average score for a startup
async function fetchAverageScore(startupId: string): Promise<number> {
  const supabase = await createClient()
  
  logger.debug('Fetching average rating for startup', { startupId })
  
  // First, get all scores for this startup
  const { data, error } = await supabase
    .from('startup_ratings')
    .select('score')
    .eq('startup_id', startupId)

  if (error) {
    logger.error('Error fetching ratings for startup', { startupId, error })
    return 0
  }

  if (!data || data.length === 0) {
    logger.debug('No ratings found for startup', { startupId })
    return 0
  }

  // Calculate average manually
  const scores = data.map(rating => rating.score).filter(score => score !== null)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  
  logger.debug('Startup ratings calculated', { startupId, ratingsCount: scores.length, averageScore })
  
  // Return the average score (1-5 scale)
  return Math.round(averageScore * 10) / 10
}

export async function getUserStartups(userId: string): Promise<StartupWithCreator[]> {
  logger.debug('Fetching user startups', { userId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url,
      tags,
      logo_url,
      visibility,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching user startups', { userId, error })
    return []
  }

  logger.debug('Found user startups', { userId, count: data?.length || 0 })

  // Transform to include creator information using helper function
  const startupsWithCreator = (data as StartupBase[]).map(startup => 
    toCreatorStartup(startup)
  )

  logger.debug('Processed user startups', { userId, count: startupsWithCreator.length })
  return startupsWithCreator
}

export async function getUserStartupsWithRatings(userId: string): Promise<StartupWithRatings[]> {
  logger.debug('Fetching user startups with ratings', { userId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url,
      tags,
      logo_url,
      visibility,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching user startups', { userId, error })
    return []
  }

  logger.debug('Found user startups', { userId, count: data?.length || 0 })

  // Get ratings and additional data for each startup
  logger.debug('Fetching ratings and user data for each startup', { userId, startupCount: data?.length || 0 })
  const startupsWithRatings = await Promise.all(
    (data as StartupBase[]).map(async (startup, index) => {
      logger.debug('Fetching data for startup', { index: index + 1, startupName: startup.name })
      
      // Fetch average score
      const averageScore = await fetchAverageScore(startup.id)
      
      // Fetch user ratings with comments
      const { data: ratingsData } = await supabase
        .from('startup_ratings')
        .select(`
          id,
          rating,
          comment,
          user_id
        `)
        .eq('startup_id', startup.id)
      
      const userRatings = ratingsData?.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        user_id: rating.user_id
      })) || []
      
      // Fetch user data (creator info)
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', startup.user_id)
        .single()
      
      const users = userData ? { name: userData.name, email: userData.email } : undefined
      
      // Check if current user has saved this startup
      const { data: savedData } = await supabase
        .from('startup_engagements')
        .select('id')
        .eq('startup_id', startup.id)
        .eq('user_id', userId)
        .eq('type', 'saved')
        .single()
      
      const saved = !!savedData

      logger.debug('Startup data processed', { 
        startupName: startup.name, 
        averageScore, 
        ratingsCount: userRatings.length, 
        saved 
      })

      return toRatedStartup(startup, averageScore, 'You', userRatings, saved, users)
    })
  )

  logger.debug('Processed user startups with ratings', { userId, count: startupsWithRatings.length })
  return startupsWithRatings
}

export async function getStartupById(startupId: string): Promise<StartupBase | null> {
  logger.debug('Fetching startup by ID', { startupId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url,
      tags,
      logo_url,
      visibility,
      created_at,
      status,
      asks_and_opportunities
    `)
    .eq('id', startupId)
    .single()

  if (error) {
    logger.error('Error fetching startup', { startupId, error })
    return null
  }

  logger.debug('Found startup', { startupId, startupName: data?.name })
  return data
}

export async function updateStartup(startupId: string, updates: Partial<StartupBase>): Promise<boolean> {
  logger.debug('Updating startup', { startupId })
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('startups')
    .update(updates)
    .eq('id', startupId)

  if (error) {
    logger.error('Error updating startup', { startupId, error })
    return false
  }

  logger.debug('Successfully updated startup', { startupId })
  return true
} 