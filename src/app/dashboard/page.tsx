import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getUserStartupsWithRatings } from '@/lib/startups'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch additional data server-side
  const startups = await getUserStartupsWithRatings(user.id)

  // Extract unique tags from startups
  const allTags = Array.from(new Set(startups.flatMap(s => s.tags ?? [])))

  return getPageLayout(
    user, 
    userProfile, 
    <DashboardClient 
      userProfile={userProfile}
      startups={startups}
      allTags={Array.from(allTags)}
    />
  )
} 