import { createClient } from './supabase'
import { toCreatorStartup, toRatedStartup } from '@/types/helpers'
import { StartupBase, StartupWithCreator, StartupWithRatings } from '@/types/startup'
import { logger } from './logger'

// Helper function to fetch average score for a startup
async function fetchAverageScore(startupId: string): Promise<number> {
  const supabase = await createClient()
  
  // logger.debug('Fetching average rating for startup', { startupId })
  
  // First, get all scores for this startup (RLS will filter by visibility)
  const { data, error } = await supabase
    .from('startup_ratings')
    .select('score, visibility')
    .eq('startup_id', startupId)

  if (error) {
    logger.error('Error fetching ratings for startup', { startupId, error })
    return 0
  }

  if (!data || data.length === 0) {
    // logger.debug('No ratings found for startup', { startupId })
    return 0
  }

  // Calculate average manually (RLS already filtered visible ratings)
  const scores = data.map(rating => rating.score).filter(score => score !== null)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  
  // logger.debug('Startup ratings calculated', { startupId, ratingsCount: scores.length, averageScore })
  
  // Return the average score (1-5 scale)
  return Math.round(averageScore * 10) / 10
}

// Helper function to fetch dimension ratings for a startup
async function fetchDimensionRatings(startupId: string): Promise<{ [dimension: string]: { avg: number; count: number } }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startup_ratings')
    .select('dimension, score, visibility')
    .eq('startup_id', startupId)

  if (error) {
    logger.error('Error fetching dimension ratings for startup', { startupId, error })
    return {}
  }

  if (!data || data.length === 0) {
    return {}
  }

  // Group by dimension and calculate averages (RLS already filtered visible ratings)
  const dimensionGroups = data.reduce((acc, rating) => {
    if (!acc[rating.dimension]) {
      acc[rating.dimension] = []
    }
    acc[rating.dimension].push(rating.score)
    return acc
  }, {} as { [dimension: string]: number[] })

  const dimensionRatings: { [dimension: string]: { avg: number; count: number } } = {}
  
  Object.entries(dimensionGroups).forEach(([dimension, scores]) => {
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
    dimensionRatings[dimension] = {
      avg: Math.round(avg * 10) / 10,
      count: scores.length
    }
  })

  return dimensionRatings
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
      status,
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
  // logger.debug('Fetching user startups with ratings', { userId })
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
      status,
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
    (data as StartupBase[]).map(async (startup) => {
      // logger.debug('Fetching data for startup', { index: index + 1, startupName: startup.name })
      
      // Fetch average score and dimension ratings
      const averageScore = await fetchAverageScore(startup.id)
      const dimensionRatings = await fetchDimensionRatings(startup.id)
      
      // Fetch user ratings with comments (RLS will filter by visibility)
      const { data: ratingsData } = await supabase
        .from('startup_ratings')
        .select(`
          id,
          dimension,
          score,
          comment,
          user_id,
          visibility
        `)
        .eq('startup_id', startup.id)
      
      const userRatings = ratingsData?.map(rating => ({
        id: rating.id,
        dimension: rating.dimension,
        score: rating.score,
        comment: rating.comment,
        user_id: rating.user_id,
        visibility: rating.visibility
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

      // Check if current user has expressed interest in this startup
      const { data: interestedData } = await supabase
        .from('startup_engagements')
        .select('id')
        .eq('startup_id', startup.id)
        .eq('user_id', userId)
        .eq('type', 'interest')
        .single()
      
      const interested = !!interestedData

      // logger.debug('Startup data processed', { 
      //   startupName: startup.name, 
      //   averageScore, 
      //   ratingsCount: userRatings.length, 
      //   saved,
      //   interested
      // })

      return toRatedStartup(startup, averageScore, 'You', userRatings, dimensionRatings, saved, interested, users)
    })
  )

  // logger.debug('Processed user startups with ratings', { userId, count: startupsWithRatings.length })
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

export async function getStartupWithFullDetails(startupId: string, currentUserId: string): Promise<StartupWithRatings | null> {
  logger.debug('Fetching startup with full details', { startupId, currentUserId })
  const supabase = await createClient()
  
  // First, get the startup data
  const { data: startupData, error: startupError } = await supabase
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

  if (startupError || !startupData) {
    logger.error('Error fetching startup', { startupId, error: startupError })
    return null
  }

  // Fetch average score and dimension ratings
  const averageScore = await fetchAverageScore(startupId)
  const dimensionRatings = await fetchDimensionRatings(startupId)
  
  // Fetch all ratings with comments
  const { data: ratingsData } = await supabase
    .from('startup_ratings')
    .select(`
      id,
      dimension,
      score,
      comment,
      user_id,
      visibility
    `)
    .eq('startup_id', startupId)
  
  const userRatings = ratingsData?.map(rating => ({
    id: rating.id,
    dimension: rating.dimension,
    score: rating.score,
    comment: rating.comment,
    user_id: rating.user_id,
    visibility: rating.visibility
  })) || []
  
  // Fetch user data (creator info)
  const { data: userData } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', startupData.user_id)
    .single()
  
  const users = userData ? { name: userData.name, email: userData.email } : undefined
  
  // Check if current user has saved this startup
  const { data: savedData } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startupId)
    .eq('user_id', currentUserId)
    .eq('type', 'saved')
    .single()
  
  const saved = !!savedData

  // Check if current user has expressed interest in this startup
  const { data: interestedData } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startupId)
    .eq('user_id', currentUserId)
    .eq('type', 'interest')
    .single()
  
  const interested = !!interestedData

  logger.debug('Startup with full details processed', { 
    startupId, 
    startupName: startupData.name, 
    averageScore, 
    ratingsCount: userRatings.length, 
    saved,
    interested
  })

  return toRatedStartup(startupData, averageScore, 'You', userRatings, dimensionRatings, saved, interested, users)
} 

export async function toggleStartupEngagement(
  startupId: string, 
  userId: string, 
  type: 'saved' | 'interest'
): Promise<boolean> {
  logger.debug('Toggling startup engagement', { startupId, userId, type })
  const supabase = await createClient()
  
  // First, check if engagement already exists
  const { data: existingEngagement } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startupId)
    .eq('user_id', userId)
    .eq('type', type)
    .single()

  if (existingEngagement) {
    // Remove existing engagement
    const { error } = await supabase
      .from('startup_engagements')
      .delete()
      .eq('id', existingEngagement.id)

    if (error) {
      logger.error('Error removing startup engagement', { startupId, userId, type, error })
      return false
    }

    logger.debug('Removed startup engagement', { startupId, userId, type })
    return true
  } else {
    // Add new engagement
    const { error } = await supabase
      .from('startup_engagements')
      .insert({
        startup_id: startupId,
        user_id: userId,
        type: type
      })

    if (error) {
      logger.error('Error adding startup engagement', { startupId, userId, type, error })
      return false
    }

    logger.debug('Added startup engagement', { startupId, userId, type })
    return true
  }
}

export async function getAllVisibleStartupsWithRatings(currentUserId: string): Promise<StartupWithRatings[]> {
  logger.debug('Fetching all visible startups with ratings', { currentUserId })
  const supabase = await createClient()
  
  // Get startups that are public, owned by current user, OR where user has access
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
      status,
      created_at
    `)
    .or(`visibility.eq.public,user_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching visible startups', { error })
    return []
  }

  // Get startups where user has explicit access
  const { data: accessData, error: accessError } = await supabase
    .from('startup_access')
    .select('startup_id')
    .eq('user_id', currentUserId)

  if (accessError) {
    logger.error('Error fetching startup access', { error: accessError })
  }

  const accessibleStartupIds = accessData?.map(a => a.startup_id) || []
  
  // Get additional startups where user has access
  let additionalStartups: StartupBase[] = []
  if (accessibleStartupIds.length > 0) {
    const { data: additionalData, error: additionalError } = await supabase
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
        status,
        created_at
      `)
      .in('id', accessibleStartupIds)
      .not('user_id', 'eq', currentUserId) // Exclude own startups (already included above)
      .not('visibility', 'eq', 'public') // Exclude public startups (already included above)

    if (additionalError) {
      logger.error('Error fetching additional accessible startups', { error: additionalError })
    } else {
      additionalStartups = additionalData || []
    }
  }

  // Combine and deduplicate startups
  const allStartups = [...(data || []), ...additionalStartups]
  const uniqueStartups = allStartups.filter((startup, index, self) => 
    index === self.findIndex(s => s.id === startup.id)
  )

  logger.debug('Found visible startups', { 
    count: uniqueStartups.length,
    publicOwned: data?.length || 0,
    accessible: additionalStartups.length
  })

  // Get ratings and additional data for each startup
  const startupsWithRatings = await Promise.all(
    uniqueStartups.map(async (startup) => {
      // Fetch average score and dimension ratings
      const averageScore = await fetchAverageScore(startup.id)
      const dimensionRatings = await fetchDimensionRatings(startup.id)
      
      // Fetch user ratings with comments (RLS will filter by visibility)
      const { data: ratingsData } = await supabase
        .from('startup_ratings')
        .select(`
          id,
          dimension,
          score,
          comment,
          user_id,
          visibility
        `)
        .eq('startup_id', startup.id)
      
      const userRatings = ratingsData?.map(rating => ({
        id: rating.id,
        dimension: rating.dimension,
        score: rating.score,
        comment: rating.comment,
        user_id: rating.user_id,
        visibility: rating.visibility
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
        .eq('user_id', currentUserId)
        .eq('type', 'saved')
        .single()
      
      const saved = !!savedData

      // Check if current user has expressed interest in this startup
      const { data: interestedData } = await supabase
        .from('startup_engagements')
        .select('id')
        .eq('startup_id', startup.id)
        .eq('user_id', currentUserId)
        .eq('type', 'interest')
        .single()
      
      const interested = !!interestedData

      // Determine if this is the current user's startup
      const isOwnStartup = startup.user_id === currentUserId
      const creatorName = isOwnStartup ? 'You' : users?.name || 'Unknown'

      return toRatedStartup(startup, averageScore, creatorName, userRatings, dimensionRatings, saved, interested, users)
    })
  )

  logger.debug('Processed visible startups with ratings', { count: startupsWithRatings.length })
  return startupsWithRatings
}

export async function getUserEngagements(userId: string): Promise<{
  saved: string[]
  interested: string[]
}> {
  logger.debug('Fetching user engagements', { userId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startup_engagements')
    .select('startup_id, type')
    .eq('user_id', userId)

  if (error) {
    logger.error('Error fetching user engagements', { userId, error })
    return { saved: [], interested: [] }
  }

  const saved = data?.filter(e => e.type === 'saved').map(e => e.startup_id) || []
  const interested = data?.filter(e => e.type === 'interest').map(e => e.startup_id) || []

  logger.debug('Found user engagements', { userId, savedCount: saved.length, interestedCount: interested.length })
  return { saved, interested }
}

export async function getAverageRatings(startupId: string): Promise<{ [dimension: string]: { avg: number; count: number } }> {
  logger.debug('Getting average ratings for startup', { startupId })
  return await fetchDimensionRatings(startupId)
}

/**
 * Check if a user can view sensitive data (ratings, comments) for a startup
 * Based on visibility settings and access control
 */
export async function canViewSensitiveData(
  startupId: string,
  currentUserId: string
): Promise<boolean> {
  logger.debug('Checking if user can view sensitive data', { startupId, currentUserId })
  const supabase = await createClient()

  // Get startup visibility
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('visibility, user_id')
    .eq('id', startupId)
    .single()

  if (startupError || !startup) {
    logger.error('Error fetching startup for visibility check', { startupId, error: startupError })
    return false
  }

  // Owner can always view sensitive data
  if (startup.user_id === currentUserId) {
    logger.debug('User owns startup, can view sensitive data', { startupId, currentUserId })
    return true
  }

  // Public startups show sensitive data to everyone
  if (startup.visibility === 'public') {
    logger.debug('Startup is public, user can view sensitive data', { startupId, currentUserId })
    return true
  }

  // For private/invite-only startups, check explicit access
  const { data: access, error: accessError } = await supabase
    .from('startup_access')
    .select('role')
    .eq('startup_id', startupId)
    .eq('user_id', currentUserId)
    .in('role', ['viewer', 'commenter', 'editor'])
    .single()

  if (accessError || !access) {
    logger.debug('User has no access to sensitive data', { startupId, currentUserId })
    return false
  }

  logger.debug('User has access to sensitive data', { startupId, currentUserId, role: access.role })
  return true
}

export async function getUserSavedStartupsWithRatings(userId: string): Promise<StartupWithRatings[]> {
  logger.debug('Fetching user saved startups with ratings', { userId })
  const supabase = await createClient()
  
  // First, get the startup IDs that the user has saved
  const { data: savedEngagements, error: engagementsError } = await supabase
    .from('startup_engagements')
    .select('startup_id')
    .eq('user_id', userId)
    .eq('type', 'saved')

  if (engagementsError) {
    logger.error('Error fetching saved engagements', { userId, error: engagementsError })
    return []
  }

  if (!savedEngagements || savedEngagements.length === 0) {
    logger.debug('No saved startups found', { userId })
    return []
  }

  const savedStartupIds = savedEngagements.map(e => e.startup_id)

  // Get the actual startup data for saved startups
  const { data: startupsData, error: startupsError } = await supabase
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
      status,
      created_at
    `)
    .in('id', savedStartupIds)
    .order('created_at', { ascending: false })

  if (startupsError) {
    logger.error('Error fetching saved startups', { userId, error: startupsError })
    return []
  }

  logger.debug('Found saved startups', { userId, count: startupsData?.length || 0 })

  // Get ratings and additional data for each saved startup
  const savedStartupsWithRatings = await Promise.all(
    (startupsData as StartupBase[]).map(async (startup) => {
      // Fetch average score and dimension ratings
      const averageScore = await fetchAverageScore(startup.id)
      const dimensionRatings = await fetchDimensionRatings(startup.id)
      
      // Fetch user ratings with comments (RLS will filter by visibility)
      const { data: ratingsData } = await supabase
        .from('startup_ratings')
        .select(`
          id,
          dimension,
          score,
          comment,
          user_id,
          visibility
        `)
        .eq('startup_id', startup.id)
      
      const userRatings = ratingsData?.map(rating => ({
        id: rating.id,
        dimension: rating.dimension,
        score: rating.score,
        comment: rating.comment,
        user_id: rating.user_id,
        visibility: rating.visibility
      })) || []
      
      // Fetch user data (creator info)
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', startup.user_id)
        .single()
      
      const users = userData ? { name: userData.name, email: userData.email } : undefined
      
      // Check if current user has saved this startup (should be true for all)
      const saved = true

      // Check if current user has expressed interest in this startup
      const { data: interestedData } = await supabase
        .from('startup_engagements')
        .select('id')
        .eq('startup_id', startup.id)
        .eq('user_id', userId)
        .eq('type', 'interest')
        .single()
      
      const interested = !!interestedData

      // Determine if this is the current user's startup
      const isOwnStartup = startup.user_id === userId
      const creatorName = isOwnStartup ? 'You' : users?.name || 'Unknown'

      return toRatedStartup(startup, averageScore, creatorName, userRatings, dimensionRatings, saved, interested, users)
    })
  )

  logger.debug('Processed saved startups with ratings', { userId, count: savedStartupsWithRatings.length })
  return savedStartupsWithRatings
}

 