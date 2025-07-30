'use client'

import { useState, memo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, Plus, X } from 'lucide-react'
import { getDisplayName } from '@/lib/profile'
import { StartupWithRatings } from '@/types/startup'
import { UserProfile } from '@/lib/profile'
import { ExploreGridClient } from '@/components/startup/ExploreGridClient'

interface DashboardClientProps {
  userProfile: UserProfile | null
  startups: StartupWithRatings[]
  savedStartups: StartupWithRatings[]
  allTags: string[]
}

export const DashboardClient = memo(function DashboardClient({ 
  userProfile, 
  startups, 
  savedStartups,
  allTags 
}: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(1)
  const [maxRating, setMaxRating] = useState<number>(5)
  const [showFilters, setShowFilters] = useState(false)

  // Parse URL params on component mount
  useEffect(() => {
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const visibility = searchParams.get('visibility')?.split(',').filter(Boolean) || []
    const status = searchParams.get('status')?.split(',').filter(Boolean) || []
    const min = searchParams.get('minRating')
    const max = searchParams.get('maxRating')
    
    setSelectedTags(tags)
    setSelectedVisibility(visibility)
    setSelectedStatus(status)
    setMinRating(min ? parseInt(min) : 1)
    setMaxRating(max ? parseInt(max) : 5)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = (newFilters: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','))
        } else {
          params.delete(key)
        }
      } else {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
    })

    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  // Filter change handlers
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
    updateURL({ tags })
  }

  const handleVisibilityChange = (visibility: string[]) => {
    setSelectedVisibility(visibility)
    updateURL({ visibility })
  }

  const handleStatusChange = (status: string[]) => {
    setSelectedStatus(status)
    updateURL({ status })
  }

  const handleMinRatingChange = (value: number[]) => {
    const newMin = value[0]
    setMinRating(newMin)
    updateURL({ minRating: newMin.toString() })
  }

  const handleMaxRatingChange = (value: number[]) => {
    const newMax = value[0]
    setMaxRating(newMax)
    updateURL({ maxRating: newMax.toString() })
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedVisibility([])
    setSelectedStatus([])
    setMinRating(1)
    setMaxRating(5)
    router.push('/dashboard', { scroll: false })
  }

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    const matchesVisibility = selectedVisibility.length === 0 || 
                             selectedVisibility.includes(startup.visibility || 'public')
    const matchesStatus = selectedStatus.length === 0 || 
                         selectedStatus.includes(startup.status || 'active')
    const matchesRating = (startup.avg_rating ?? 0) >= minRating && (startup.avg_rating ?? 0) <= maxRating
    
    return matchesSearch && matchesTags && matchesVisibility && matchesStatus && matchesRating
  })

  const filteredSavedStartups = savedStartups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    const matchesVisibility = selectedVisibility.length === 0 || 
                             selectedVisibility.includes(startup.visibility || 'public')
    const matchesStatus = selectedStatus.length === 0 || 
                         selectedStatus.includes(startup.status || 'active')
    const matchesRating = (startup.avg_rating ?? 0) >= minRating && (startup.avg_rating ?? 0) <= maxRating
    
    return matchesSearch && matchesTags && matchesVisibility && matchesStatus && matchesRating
  })

  const visibilityOptions = ['public', 'private', 'invite-only']
  const statusOptions = ['active', 'paused', 'closed']

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
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tags Filter */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleTagsChange([...selectedTags, tag])
                          } else {
                            handleTagsChange(selectedTags.filter(t => t !== tag))
                          }
                        }}
                      />
                      <Label htmlFor={`tag-${tag}`} className="text-sm font-normal">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility Filter */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="space-y-2">
                  {visibilityOptions.map(visibility => (
                    <div key={visibility} className="flex items-center space-x-2">
                      <Checkbox
                        id={`visibility-${visibility}`}
                        checked={selectedVisibility.includes(visibility)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleVisibilityChange([...selectedVisibility, visibility])
                          } else {
                            handleVisibilityChange(selectedVisibility.filter(v => v !== visibility))
                          }
                        }}
                      />
                      <Label htmlFor={`visibility-${visibility}`} className="text-sm font-normal capitalize">
                        {visibility}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={selectedStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleStatusChange([...selectedStatus, status])
                          } else {
                            handleStatusChange(selectedStatus.filter(s => s !== status))
                          }
                        }}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm font-normal capitalize">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Range */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Min Rating: {minRating}</Label>
                  <Slider
                    value={[minRating]}
                    onValueChange={handleMinRatingChange}
                    max={maxRating}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Rating: {maxRating}</Label>
                  <Slider
                    value={[maxRating]}
                    onValueChange={handleMaxRatingChange}
                    max={5}
                    min={minRating}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Quick Tag Selection */}
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 10).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  handleTagsChange(selectedTags.filter(t => t !== tag))
                } else {
                  handleTagsChange([...selectedTags, tag])
                }
              }}
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
          <ExploreGridClient
            variant="dashboard"
            startups={filteredStartups}
            showOwner={false}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <ExploreGridClient
            variant="dashboard"
            startups={filteredSavedStartups}
            showOwner={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}) 