import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  return getPageLayout(
    user,
    userProfile,
    <ProfileClient user={user} userProfile={userProfile} />
  )
} 