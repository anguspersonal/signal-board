import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getFilteredStartups, getUserSavedStartupsWithRatings } from '@/lib/startups'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch additional data server-side
  const [startups, savedStartups] = await Promise.all([
    getFilteredStartups(user.id, {
      userOnly: true,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }),
    getUserSavedStartupsWithRatings(user.id)
  ])

  // Extract unique tags from all startups (both owned and saved)
  const allStartups = [...startups, ...savedStartups]
  const allTags = Array.from(new Set(allStartups.flatMap(s => s.tags ?? [])))

  return getPageLayout(
    user, 
    userProfile, 
    <DashboardClient 
      userProfile={userProfile}
      startups={startups}
      savedStartups={savedStartups}
      allTags={Array.from(allTags)}
    />
  )
} 