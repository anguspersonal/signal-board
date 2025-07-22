import { createClient } from './supabase'
import { Startup, StartupData } from '@/types/startup'

// Helper function to fetch average score for a startup
async function fetchAverageScore(startupId: string): Promise<number> {
  const supabase = await createClient()
  
  console.log(`🔍 Fetching average rating for startup: ${startupId}`)
  
  // First, get all scores for this startup
  const { data, error } = await supabase
    .from('startup_ratings')
    .select('score')
    .eq('startup_id', startupId)

  if (error) {
    console.error(`❌ Error fetching ratings for startup ${startupId}:`, error)
    return 0
  }

  if (!data || data.length === 0) {
    console.log(`📊 No ratings found for startup ${startupId}, returning 0`)
    return 0
  }

  // Calculate average manually
  const scores = data.map(rating => rating.score).filter(score => score !== null)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  
  console.log(`📊 Startup ${startupId}: ${scores.length} ratings, avg score: ${averageScore}`)
  
  // Return the average score (1-5 scale)
  return Math.round(averageScore * 10) / 10
}

export async function getUserStartups(userId: string): Promise<Startup[]> {
  console.log('📊 Fetching user startups...')
  const supabase = await createClient()
  
  console.log('🔍 Querying startups table for user:', userId)
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching user startups:', error)
    return []
  }

  console.log(`✅ Found ${data?.length || 0} user startups`)

  // Get ratings for each startup to calculate average scores
  console.log('📈 Fetching ratings for each startup...')
  const startupsWithRatings = await Promise.all(
    (data as StartupData[]).map(async (startup, index) => {
      console.log(`  🔍 Fetching ratings for startup ${index + 1}: ${startup.name}`)
      
      const averageScore = await fetchAverageScore(startup.id)

      console.log(`  📊 Startup ${startup.name}: avg score: ${averageScore}`)

      return {
        id: startup.id,
        name: startup.name,
        description: startup.description,
        creator_name: 'You',
        average_score: averageScore,
        website_url: startup.website_url
      }
    })
  )

  console.log(`✅ Processed ${startupsWithRatings.length} user startups with ratings`)
  return startupsWithRatings
}

export async function getPublicStartups(): Promise<Startup[]> {
  console.log('📊 Fetching public startups...')
  const supabase = await createClient()
  
  console.log('🔍 Querying startups table...')
  const { data, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching startups:', error)
    return []
  }

  console.log(`✅ Found ${data?.length || 0} public startups`)

  // Get ratings for each startup to calculate average scores
  console.log('📈 Fetching ratings for each startup...')
  const startupsWithRatings = await Promise.all(
    (data as StartupData[]).map(async (startup, index) => {
      console.log(`  🔍 Fetching ratings for startup ${index + 1}: ${startup.name}`)
      
      const averageScore = await fetchAverageScore(startup.id)

      console.log(`  📊 Startup ${startup.name}: avg score: ${averageScore}`)

      // For now, we'll use a generic creator name since we can't easily access auth.users
      // In a real app, you might want to create a profiles table or use a different approach
      return {
        id: startup.id,
        name: startup.name,
        description: startup.description,
        creator_name: 'Anonymous Creator', // We'll improve this later
        average_score: averageScore,
        website_url: startup.website_url
      }
    })
  )

  console.log(`✅ Processed ${startupsWithRatings.length} startups with ratings`)
  return startupsWithRatings
}

export async function getStartupById(id: string): Promise<Startup | null> {
  console.log(`📊 Fetching startup by ID: ${id}`)
  const supabase = await createClient()
  
  // Get the current user to check if they're the creator
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('🔍 Querying startups table for specific startup...')
  let query = supabase
    .from('startups')
    .select(`
      id,
      name,
      description,
      user_id,
      website_url
    `)
    .eq('id', id)
  
  // If user is authenticated, allow access to their own startups or public ones
  if (user) {
    query = query.or(`visibility.eq.public,user_id.eq.${user.id}`)
  } else {
    // For anonymous users, only show public startups
    query = query.eq('visibility', 'public')
  }
  
  const { data, error } = await query.single()

  if (error || !data) {
    console.error('❌ Error fetching startup:', error)
    return null
  }

  console.log(`✅ Found startup: ${data.name}`)

  // Get ratings for this startup
  console.log('📈 Fetching ratings for this startup...')
  const averageScore = await fetchAverageScore(data.id)

  console.log(`📊 Startup ${data.name}: avg score: ${averageScore}`)

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    creator_name: user && data.user_id === user.id ? 'You' : 'Anonymous Creator',
    average_score: averageScore,
    website_url: data.website_url
  }
} 