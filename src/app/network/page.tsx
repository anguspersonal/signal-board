import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { NetworkClient } from './NetworkClient'
import { NetworkConnection, SuggestedConnection } from '@/types/network'

export default async function NetworkPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // TODO: Replace with real data fetching
  // For now, we'll pass empty arrays and let the client component handle mock data
  const networkConnections: NetworkConnection[] = []
  const suggestedConnections: SuggestedConnection[] = []

  return getPageLayout(
    user,
    userProfile,
    <NetworkClient 
      networkConnections={networkConnections}
      suggestedConnections={suggestedConnections}
    />
  )
} 