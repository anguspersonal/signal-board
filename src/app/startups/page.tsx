import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getFilteredStartups } from '@/lib/startups'
import { ExploreWrapper } from '@/components/startup/ExploreWrapper'

export default async function StartupsPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch all visible startups (public + user's own private startups)
  const startups = await getFilteredStartups(user.id, {
    visibility: ['public', 'invite-only']
  })

  return getPageLayout(
    user,
    userProfile,
    <ExploreWrapper startups={startups} />,
    {
      sideNavigationProps: {
        // This will be overridden by the client component
        forceCollapsed: false
      }
    }
  )
} 