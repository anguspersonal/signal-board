import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { getUserStartupsWithRatings } from '@/lib/startups'
import { StartupCard } from '@/components/StartupCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function StartupsPage() {
  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch user startups server-side
  const startups = await getUserStartupsWithRatings(user.id)

  return getPageLayout(
    user,
    userProfile,
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Startups</h1>
          <p className="text-slate-600 mt-1">
            Manage and track your startup submissions
          </p>
        </div>
        <Link href="/startups/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Startup</span>
          </Button>
        </Link>
      </div>

      {/* Startups Grid */}
      {startups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No startups yet</div>
          <p className="text-gray-400 mb-4">
            Start by adding your first startup to get feedback from the community
          </p>
          <Link href="/startups/new">
            <Button>Add Your First Startup</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}
    </div>
  )
} 