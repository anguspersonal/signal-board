import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getStartupWithFullDetails, canViewSensitiveData } from '@/lib/startups'
import { notFound } from 'next/navigation'
import { StartupDetailView } from '@/components/startup/StartupDetailView'

interface StartupPageProps {
  params: Promise<{ id: string }>
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { id } = await params
  
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()
  
  // Fetch startup with full details
  const startup = await getStartupWithFullDetails(id, user.id)
  
  if (!startup) {
    notFound()
  }

  // Check if user can view sensitive data (ratings, comments)
  const canViewSensitive = await canViewSensitiveData(id, user.id)

  return getPageLayout(
    user,
    userProfile,
    <StartupDetailView startup={startup} canViewSensitiveData={canViewSensitive} />
  )
} 