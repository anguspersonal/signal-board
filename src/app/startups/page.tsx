import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getFilteredStartups } from '@/lib/startups'
import { StartupFilterOptions } from '@/types/startup'
import { ExploreWrapper } from '@/components/startup/ExploreWrapper'

// Helper function to parse searchParams into StartupFilterOptions
function parseFilters(params: Record<string, string | string[] | undefined>): StartupFilterOptions {
  const parseArray = (val?: string | string[]) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    return val.split(',').filter(Boolean)
  }
  
  return {
    tags: parseArray(params.tags),
    visibility: parseArray(params.visibility),
    status: parseArray(params.status),
    minRating: params.minRating ? Number(params.minRating) : undefined,
    maxRating: params.maxRating ? Number(params.maxRating) : undefined,
    userOnly: false, // Public view - don't filter to user's startups only
    sortBy: 'created_at',
    sortOrder: 'desc',
  }
}

export default async function StartupsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Parse filters from URL parameters
  const filters = parseFilters(searchParams)

  // Fetch filtered startups
  const startups = await getFilteredStartups(user.id, filters)

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