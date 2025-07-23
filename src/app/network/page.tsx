import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUserProfileServer } from '@/lib/profile-server'
import { AppLayout } from '@/components/AppLayout'
import { Navigation } from '@/components/Navigation'
import { SideNavigation } from '@/components/SideNavigation'
import { NetworkClient } from './NetworkClient'
import { NetworkConnection, SuggestedConnection } from '@/types/network'

export default async function NetworkPage() {
  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // Fetch user profile server-side
  const userProfile = await getUserProfileServer(user.id)

  // TODO: Replace with real data fetching
  // For now, we'll pass empty arrays and let the client component handle mock data
  const networkConnections: NetworkConnection[] = []
  const suggestedConnections: SuggestedConnection[] = []

  return (
    <AppLayout 
      navigation={<Navigation user={user} userProfile={userProfile} />}
      sideNavigation={<SideNavigation />}
    >
      <NetworkClient 
        networkConnections={networkConnections}
        suggestedConnections={suggestedConnections}
      />
    </AppLayout>
  )
} 