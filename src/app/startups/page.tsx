import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getAllVisibleStartupsWithRatings } from '@/lib/startups'
import { StartupsClient } from './StartupsClient'

export default async function StartupsPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch all visible startups (public + user's own private startups)
  const startups = await getAllVisibleStartupsWithRatings(user.id)

  return getPageLayout(
    user,
    userProfile,
    <StartupsClient startups={startups} />
  )
} 