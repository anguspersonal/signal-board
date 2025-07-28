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
import { StartupsClient } from '@/app/startups/StartupsClient'



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
                         (startup.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const filteredSavedStartups = savedStartups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    return matchesSearch && matchesTags
  })



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
          <StartupsClient
            variant="dashboard"
            startups={filteredStartups}
            showOwner={false}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <StartupsClient
            variant="dashboard"
            startups={filteredSavedStartups}
            showOwner={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 