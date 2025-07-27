import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { FeedClient } from './FeedClient'
import { ActivityItem } from '@/types/activity'
import { StartupWithRatings } from '@/types/startups'

export default async function FeedPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // TODO: Replace with real data fetching
  // For now, we'll pass empty arrays and let the client component handle mock data
  const activities: ActivityItem[] = []
  const trendingStartups: StartupWithRatings[] = []

  return getPageLayout(
    user,
    userProfile,
    <FeedClient 
      activities={activities}
      trendingStartups={trendingStartups}
    />
  )
} 