import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { StartupForm } from '@/components/startup/StartupForm'

export default async function NewStartupPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  return getPageLayout(
    user,
    userProfile,
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add New Startup</h1>
        <p className="text-slate-600 mt-1">
          Share your startup with the community for evaluation and feedback
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <StartupForm userId={user.id} />
      </div>
    </div>
  )
} 