'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus, ExternalLink } from 'lucide-react'
import { getDisplayName } from '@/lib/profile'
import { StartupWithRatings } from '@/types/startup'
import { UserProfile } from '@/lib/profile'

interface DashboardClientProps {
  userProfile: UserProfile | null
  startups: StartupWithRatings[]
  allTags: string[]
}

const StartupCard = ({ startup, showOwner = false, onUpdate }: { 
  startup: StartupWithRatings, 
  showOwner?: boolean, 
  onUpdate: () => void 
}) => (
  <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-gray-900">{startup.name || 'Unnamed Startup'}</h3>
        <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
      </div>
      <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
        <span className="text-sm font-medium text-blue-700">
          {startup.avg_rating ? `${startup.avg_rating}/5` : 'Not rated'}
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-4">{startup.description || 'No description available'}</p>
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



export function DashboardClient({ userProfile, startups, allTags }: DashboardClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [savedStartups] = useState<StartupWithRatings[]>([])

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
    return matchesSearch
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
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Startup
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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 