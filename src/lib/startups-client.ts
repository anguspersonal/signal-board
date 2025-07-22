import { createBrowserSupabaseClient } from './supabase-client'
import { Startup, StartupData } from '@/types/startup'

// Helper function to fetch average score for a startup
async function fetchAverageScore(startupId: string): Promise<number> {
  const supabase = createBrowserSupabaseClient()
  
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
  const supabase = createBrowserSupabaseClient()
  
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