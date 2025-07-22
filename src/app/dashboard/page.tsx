'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { getUserStartups } from '@/lib/startups-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus, Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'


interface StartupWithRatings {
  id: string
  user_id: string
  name: string
  description: string
  tags?: string[]
  logo_url?: string
  website_url?: string
  visibility: 'private' | 'invite-only' | 'public'
  created_at: string
  updated_at: string
  avg_rating?: number
  user_ratings?: Array<{ id: string; rating: number; comment?: string; user_id: string }>
  saved?: boolean
  users?: { name: string; email: string }
}

import { Navigation } from '@/components/Navigation'

const StartupCard = ({ startup, showOwner = false, onUpdate }: { 
  startup: StartupWithRatings, 
  showOwner?: boolean, 
  onUpdate: () => void 
}) => (
  <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{startup.name}</h3>
      <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
        <span className="text-sm font-medium text-blue-700">
          {startup.avg_rating || 0}/5
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-4">{startup.description}</p>
    {startup.tags && startup.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-4">
        {startup.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    )}
    <div className="flex justify-between items-center">
      {showOwner && startup.users && (
        <div className="text-sm text-gray-500">
          by <span className="font-medium text-gray-700">{startup.users.name}</span>
        </div>
      )}
      <Button size="sm" onClick={onUpdate}>View Details</Button>
    </div>
  </div>
)

const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  title: string, 
  description: string, 
  actionLabel: string, 
  onAction: () => void 
}) => (
  <div className="text-center py-12">
    <div className="text-gray-500 text-lg mb-2">{title}</div>
    <p className="text-gray-400 mb-4">{description}</p>
    <Button onClick={onAction}>{actionLabel}</Button>
  </div>
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [startups, setStartups] = useState<StartupWithRatings[]>([])
  const [savedStartups, setSavedStartups] = useState<StartupWithRatings[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          redirect('/')
        }

        setUser(user)

        // Load user's startups
        const userStartups = await getUserStartups(user.id)
        const formattedStartups: StartupWithRatings[] = userStartups.map(startup => ({
          id: startup.id,
          user_id: user.id,
          name: startup.name,
          description: startup.description,
          tags: [], // You can add tags later
          visibility: 'public' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avg_rating: startup.average_score
        }))

        setStartups(formattedStartups)
        
        // Extract unique tags from startups
        const tags = new Set<string>()
        formattedStartups.forEach(startup => {
          startup.tags?.forEach(tag => tags.add(tag))
        })
        setAllTags(Array.from(tags))

        // For now, saved startups are empty - you can implement this later
        setSavedStartups([])
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndLoadData()
  }, [])

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const filteredSavedStartups = savedStartups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.email?.split('@')[0]}
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your startup evaluations and discover new opportunities
              </p>
            </div>
            <Button 
              onClick={() => router.push('/startups/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Startup
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search startups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Chart - Temporarily commented out
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Startup Performance Overview</h3>
            <div className="h-64">
              <ExampleChart />
            </div>
          </div>
          */}

          {/* Main Content */}
          <Tabs defaultValue="my-startups" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="my-startups">
                My Startups ({startups.length})
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="h-4 w-4 mr-2" />
                Saved ({savedStartups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-startups">
              {filteredStartups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStartups.map(startup => (
                    <StartupCard 
                      key={startup.id} 
                      startup={startup}
                      showOwner={false}
                      onUpdate={() => router.push(`/startups/${startup.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No startups yet"
                  description="Start building your portfolio by adding your first startup evaluation."
                  actionLabel="Add Startup"
                  onAction={() => router.push('/startups/new')}
                />
              )}
            </TabsContent>

            <TabsContent value="saved">
              {filteredSavedStartups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedStartups.map(startup => (
                    <StartupCard 
                      key={startup.id} 
                      startup={startup}
                      showOwner={true}
                      onUpdate={() => router.push(`/startups/${startup.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No saved startups"
                  description="Save startups from your network to keep track of interesting opportunities."
                  actionLabel="Explore Network"
                  onAction={() => router.push('/startups')}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 