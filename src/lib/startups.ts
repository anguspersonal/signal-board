import { createClient } from './supabase'
import { toCreatorStartup, toRatedStartup } from '@/types/helpers'
import { StartupBase, StartupWithCreator, StartupWithRatings, StartupFilterOptions } from '@/types/startup'
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

// Shared helper function to enrich a startup with ratings and metadata
async function enrichStartupWithRatingsAndMeta(
  startup: StartupBase,
  currentUserId: string
): Promise<StartupWithRatings | null> {
  // Fetch average score and dimension ratings
  const averageScore = await fetchAverageScore(startup.id)
  const dimensionRatings = await fetchDimensionRatings(startup.id)

  // Fetch user ratings
  const supabase = await createClient()
  const { data: ratingsData } = await supabase
    .from('startup_ratings')
    .select('id, dimension, score, comment, user_id, visibility')
    .eq('startup_id', startup.id)

  const userRatings = ratingsData?.map(rating => ({
    id: rating.id,
    dimension: rating.dimension,
    score: rating.score,
    comment: rating.comment,
    user_id: rating.user_id,
    visibility: rating.visibility
  })) || []

  // Fetch creator info
  const { data: userData } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', startup.user_id)
    .single()

  const users = userData ? { name: userData.name, email: userData.email } : undefined

  // Check saved
  const { data: savedData } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startup.id)
    .eq('user_id', currentUserId)
    .eq('type', 'saved')
    .single()
  const saved = !!savedData

  // Check interested
  const { data: interestedData } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startup.id)
    .eq('user_id', currentUserId)
    .eq('type', 'interest')
    .single()
  const interested = !!interestedData

  const isOwnStartup = startup.user_id === currentUserId
  const creatorName = isOwnStartup ? 'You' : users?.name || 'Unknown'

  return toRatedStartup(
    startup,
    averageScore,
    creatorName,
    userRatings,
    dimensionRatings,
    saved,
    interested,
    users
  )
}

export async function getUserStartups(userId: string): Promise<StartupWithCreator[]> {
  logger.debug('Fetching user startups', { userId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      summary,
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
      summary,
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
      
      const enrichedStartup = await enrichStartupWithRatingsAndMeta(startup, userId)
      
      // logger.debug('Startup data processed', { 
      //   startupName: startup.name, 
      //   averageScore: enrichedStartup?.avg_rating, 
      //   ratingsCount: enrichedStartup?.user_ratings?.length, 
      //   saved: enrichedStartup?.saved,
      //   interested: enrichedStartup?.interested
      // })

      return enrichedStartup
    })
  )

  // logger.debug('Processed user startups with ratings', { userId, count: startupsWithRatings.length })
  return startupsWithRatings.filter(Boolean) as StartupWithRatings[]
}

export async function getStartupById(startupId: string): Promise<StartupBase | null> {
  logger.debug('Fetching startup by ID', { startupId })
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      summary,
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
      summary,
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

  const enrichedStartup = await enrichStartupWithRatingsAndMeta(startupData, currentUserId)

  logger.debug('Startup with full details processed', { 
    startupId, 
    startupName: startupData.name, 
    averageScore: enrichedStartup?.avg_rating, 
    ratingsCount: enrichedStartup?.user_ratings?.length, 
    saved: enrichedStartup?.saved,
    interested: enrichedStartup?.interested
  })

  return enrichedStartup
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

/**
 * Get filtered startups with ratings based on flexible filter options
 * @param userId - Current user ID for access control
 * @param filters - Filter options for the query
 * @returns Promise<StartupWithRatings[]>
 */
export async function getFilteredStartups(
  userId: string, 
  filters: StartupFilterOptions = {}
): Promise<StartupWithRatings[]> {
  logger.debug('Fetching filtered startups', { userId, filters })
  const supabase = await createClient()
  
  // Build the base query
  let query = supabase
    .from('startups')
    .select(`
      id,
      name,
      summary,
      description,
      user_id,
      website_url,
      tags,
      logo_url,
      visibility,
      status,
      created_at
    `)

  // Apply visibility filter
  if (filters.visibility && filters.visibility.length > 0) {
    query = query.in('visibility', filters.visibility)
  }

  // Apply user-only filter
  if (filters.userOnly) {
    query = query.eq('user_id', userId)
  } else {
    // Default behavior: include public startups and user's own startups
    query = query.or(`visibility.eq.public,user_id.eq.${userId}`)
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    // Filter startups that contain any of the specified tags
    query = query.overlaps('tags', filters.tags)
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    logger.error('Error fetching filtered startups', { userId, filters, error })
    return []
  }

  // Get startups where user has explicit access (for non-public startups)
  let accessibleStartupIds: string[] = []
  if (!filters.userOnly) {
    const { data: accessData, error: accessError } = await supabase
      .from('startup_access')
      .select('startup_id')
      .eq('user_id', userId)

    if (!accessError && accessData) {
      accessibleStartupIds = accessData.map(a => a.startup_id)
    }
  }

  // Get additional accessible startups
  let additionalStartups: StartupBase[] = []
  if (accessibleStartupIds.length > 0) {
    const { data: additionalData, error: additionalError } = await supabase
      .from('startups')
      .select(`
        id,
        name,
        summary,
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
      .not('user_id', 'eq', userId)
      .not('visibility', 'eq', 'public')

    if (!additionalError && additionalData) {
      additionalStartups = additionalData
    }
  }

  // Combine and deduplicate startups
  const allStartups = [...(data || []), ...additionalStartups]
  const uniqueStartups = allStartups.filter((startup, index, self) => 
    index === self.findIndex(s => s.id === startup.id)
  )

  logger.debug('Found filtered startups', { 
    count: uniqueStartups.length,
    filters
  })

  // Get ratings and additional data for each startup
  const startupsWithRatings = await Promise.all(
    uniqueStartups.map(async (startup) => {
      const enrichedStartup = await enrichStartupWithRatingsAndMeta(startup, userId)
      
      // Apply rating filter if specified
      if (enrichedStartup && filters.minRating && (enrichedStartup.avg_rating || 0) < filters.minRating) {
        return null
      }
      if (enrichedStartup && filters.maxRating && (enrichedStartup.avg_rating || 0) > filters.maxRating) {
        return null
      }
      
      return enrichedStartup
    })
  )

  // Filter out null results (from rating filters) and sort by rating if needed
  const filteredResults = startupsWithRatings.filter(Boolean) as StartupWithRatings[]
  
  if (filters.sortBy === 'avg_rating') {
    filteredResults.sort((a, b) => {
      const aRating = a.avg_rating || 0
      const bRating = b.avg_rating || 0
      return filters.sortOrder === 'asc' ? aRating - bRating : bRating - aRating
    })
  }

  logger.debug('Processed filtered startups with ratings', { 
    count: filteredResults.length,
    filters
  })
  
  return filteredResults
}

/**
 * @deprecated Use getFilteredStartups() instead for more flexible filtering
 */
export async function getAllVisibleStartupsWithRatings(currentUserId: string): Promise<StartupWithRatings[]> {
  logger.warn('getAllVisibleStartupsWithRatings is deprecated. Use getFilteredStartups() instead.')
  return getFilteredStartups(currentUserId, {
    visibility: ['public', 'invite-only']
  })
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
      summary,
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
      const enrichedStartup = await enrichStartupWithRatingsAndMeta(startup, userId)
      
      // Override saved status since we know these are all saved startups
      if (enrichedStartup) {
        enrichedStartup.saved = true
      }
      
      return enrichedStartup
    })
  )

  logger.debug('Processed saved startups with ratings', { userId, count: savedStartupsWithRatings.length })
  return savedStartupsWithRatings.filter(Boolean) as StartupWithRatings[]
}

 