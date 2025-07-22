import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUserStartups } from '@/lib/startups'
import UserMenu from '@/components/UserMenu'

export default async function StartupsPage() {
  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  const startups = await getUserStartups(user.id)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">StartIn</h1>
            <p className="mt-2 text-gray-600">The LinkedIn for startups</p>
          </div>
          <UserMenu userEmail={user.email!} />
        </div>

        {startups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No startups found</div>
            <p className="text-gray-400 mt-2">Add your first startup to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {startups.map((startup) => (
              <div
                key={startup.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {startup.name || 'Unnamed Startup'}
                  </h2>
                  <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                    <span className="text-sm font-medium text-blue-700">
                      {startup.average_score}/5
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {startup.description || 'No description available'}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    by <span className="font-medium text-gray-700">{startup.creator_name}</span>
                  </div>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    View More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 