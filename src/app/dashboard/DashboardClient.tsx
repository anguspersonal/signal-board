'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus } from 'lucide-react'
import { getDisplayName } from '@/lib/profile'
import { StartupWithRatings } from '@/types/startup'
import { UserProfile } from '@/lib/profile'
import { StartupCard } from '@/components/StartupCard'



export function DashboardClient({ 
  userProfile, 
  startups, 
  savedStartups,
  allTags 
}: {
  userProfile: UserProfile | null
  startups: StartupWithRatings[]
  savedStartups: StartupWithRatings[]
  allTags: string[]
}) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const filteredSavedStartups = savedStartups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const handleViewStartup = (startupId: string) => {
    router.push(`/startups/${startupId}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {getDisplayName(userProfile)}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/startups/new')}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">Add Startup</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 10).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="my-startups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-startups">My Startups</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="my-startups" className="space-y-6">
          {filteredStartups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">No startups found</div>
              <p className="text-muted-foreground mt-2">Add your first startup to get started</p>
              <Button 
                onClick={() => router.push('/startups/new')}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Startup
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((startup) => (
                <StartupCard
                  key={startup.id}
                  startup={startup}
                  showOwner={false}
                  onUpdate={() => handleViewStartup(startup.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {filteredSavedStartups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">No saved startups</div>
              <p className="text-muted-foreground mt-2">Startups you save will appear here</p>
              <Button 
                onClick={() => router.push('/startups')}
                variant="outline"
                className="mt-4"
              >
                Explore Startups
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSavedStartups.map((startup) => (
                <StartupCard
                  key={startup.id}
                  startup={startup}
                  showOwner={true}
                  onUpdate={() => handleViewStartup(startup.id)}
                />
              ))}
              
              {/* CTA Card when less than 3 saved startups */}
              {filteredSavedStartups.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px] bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-gray-400 mb-3">
                    <Search className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Discover More Startups</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Explore the startup ecosystem and save interesting companies
                  </p>
                  <Button 
                    onClick={() => router.push('/startups')}
                    variant="outline"
                    size="sm"
                  >
                    Browse Startups
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 