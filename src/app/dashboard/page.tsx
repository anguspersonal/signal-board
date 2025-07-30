import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getFilteredStartups, getUserSavedStartupsWithRatings } from '@/lib/startups'
import { StartupFilterOptions } from '@/types/startup'
import { DashboardClient } from './DashboardClient'

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
    userOnly: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
  }
}

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Record<string, string | string[] | undefined> 
}) {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Parse filters from URL parameters
  const filters = parseFilters(searchParams)

  // Fetch additional data server-side
  const [startups, savedStartups] = await Promise.all([
    getFilteredStartups(user.id, filters),
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