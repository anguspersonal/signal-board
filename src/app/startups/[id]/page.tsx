import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getStartupWithFullDetails, canViewSensitiveData } from '@/lib/startups'
import { notFound } from 'next/navigation'
import { StartupDetailView } from './StartupDetailView'

interface StartupPageProps {
  params: { id: string }
}

export default async function StartupPage({ params }: StartupPageProps) {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()
  
  // Fetch startup with full details
  const startup = await getStartupWithFullDetails(params.id, user.id)
  
  if (!startup) {
    notFound()
  }

  // Check if user can view sensitive data (ratings, comments)
  const canViewSensitive = await canViewSensitiveData(params.id, user.id)

  return getPageLayout(
    user,
    userProfile,
    <StartupDetailView startup={startup} canViewSensitiveData={canViewSensitive} />
  )
} 