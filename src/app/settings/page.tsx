import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  return getPageLayout(
    user,
    userProfile,
    <SettingsClient user={user} userProfile={userProfile} />
  )
} 