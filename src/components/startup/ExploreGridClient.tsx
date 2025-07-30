'use client'

import { useState, memo, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { StartupWithRatings } from '@/types/startup'
import { StartupDetailDrawer } from '@/components/startup/StartupDetailDrawer'
import { StartupGrid } from '@/components/startup/StartupGrid'
import { useDrawer } from '@/components/DrawerContext'

interface ExploreGridClientProps {
  variant: 'dashboard' | 'explore'
  startups: StartupWithRatings[]
  showOwner?: boolean
}

export const ExploreGridClient = memo(function ExploreGridClient({ variant, startups, showOwner = true }: ExploreGridClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'created_at'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [user, setUser] = useState<{ id: string } | null>(null)
  const { selectedStartupId, setSelectedStartupId } = useDrawer()

  // Get the authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }
    getUser()
  }, [])

  // Helper function to get sort display text
  const getSortDisplayText = () => {
    const activeFirst = "Active first, then "
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' ? `${activeFirst}Name A-Z` : `${activeFirst}Name Z-A`
      case 'rating':
        return sortOrder === 'desc' ? `${activeFirst}Highest Rated` : `${activeFirst}Lowest Rated`
      case 'created_at':
        return sortOrder === 'desc' ? `${activeFirst}Newest First` : `${activeFirst}Oldest First`
      default:
        return 'Sort'
    }
  }

  // Get all unique tags and statuses from startups
  const allTags = Array.from(new Set(startups.flatMap(startup => startup.tags || [])))
  const allStatuses = Array.from(new Set(startups.map(startup => startup.status).filter((status): status is string => Boolean(status))))

  // Filter startups based on search, tags, and status
  const filteredStartups = startups.filter(startup => {
    const matchesSearch = (startup.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => startup.tags?.includes(tag))
    const matchesStatus = selectedStatuses.length === 0 || 
                         (startup.status && selectedStatuses.includes(startup.status))
    return matchesSearch && matchesTags && matchesStatus
  })

  // Sort filtered startups
  const sortedStartups = [...filteredStartups].sort((a, b) => {
    // First, prioritize "Active" status startups
    const aIsActive = a.status === 'Active'
    const bIsActive = b.status === 'Active'
    
    if (aIsActive && !bIsActive) return -1
    if (!aIsActive && bIsActive) return 1
    
    // If both have the same active status, apply the selected sort criteria
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'rating':
        aValue = a.avg_rating || 0
        bValue = b.avg_rating || 0
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Get the selected startup
  const selectedStartup = selectedStartupId ? startups.find(s => s.id === selectedStartupId) : null

  // Handle startup card click
  const handleStartupClick = (startupId: string) => {
    if (selectedStartupId === startupId) {
      setSelectedStartupId(null) // Close drawer if clicking same card
    } else {
      setSelectedStartupId(startupId) // Open drawer or switch content
    }
  }

  // Handle click away from drawer
  const handleClickAway = () => {
    setSelectedStartupId(null)
  }

  return (
    <div className={variant === 'dashboard' ? 'space-y-4' : 'space-y-8'}>
      {/* Header - Only show for explore variant */}
      {variant === 'explore' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Startups</h1>
            <p className="mt-1 text-slate-600">
              Discover and explore early-stage startups
            </p>
          </div>
          <Link href="/startups/new">
            <Button className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="hidden truncate sm:inline">Add Startup</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Search and Filters - Only show for explore variant */}
      {variant === 'explore' && (
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search startups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="space-y-4 p-3">
                  {/* Tags Filter */}
                  <div>
                    <div className="mb-2 text-sm font-medium">Filter by Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {allTags.slice(0, 8).map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
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

                  {/* Status Filter */}
                  {allStatuses.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-medium">Filter by Status</div>
                      <div className="flex flex-wrap gap-1">
                        {allStatuses.map(status => (
                          <Badge
                            key={status}
                            variant={selectedStatuses.includes(status) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => setSelectedStatuses(prev => 
                              prev.includes(status) 
                                ? prev.filter(s => s !== status)
                                : [...prev, status]
                            )}
                          >
                            {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear All Filters */}
                  {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTags([])
                        setSelectedStatuses([])
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <span className="text-sm">{getSortDisplayText()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => { setSortBy('name'); setSortOrder('asc') }}
                  className={sortBy === 'name' && sortOrder === 'asc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Name A-Z</span>
                    {sortBy === 'name' && sortOrder === 'asc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('name'); setSortOrder('desc') }}
                  className={sortBy === 'name' && sortOrder === 'desc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Name Z-A</span>
                    {sortBy === 'name' && sortOrder === 'desc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('rating'); setSortOrder('desc') }}
                  className={sortBy === 'rating' && sortOrder === 'desc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Highest Rated</span>
                    {sortBy === 'rating' && sortOrder === 'desc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('rating'); setSortOrder('asc') }}
                  className={sortBy === 'rating' && sortOrder === 'asc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Lowest Rated</span>
                    {sortBy === 'rating' && sortOrder === 'asc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('created_at'); setSortOrder('desc') }}
                  className={sortBy === 'created_at' && sortOrder === 'desc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Newest First</span>
                    {sortBy === 'created_at' && sortOrder === 'desc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => { setSortBy('created_at'); setSortOrder('asc') }}
                  className={sortBy === 'created_at' && sortOrder === 'asc' ? 'bg-accent' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Active first, then Oldest First</span>
                    {sortBy === 'created_at' && sortOrder === 'asc' && (
                      <span className="text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Display */}
          {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                >
                  {tag} ×
                </Badge>
              ))}
              {selectedStatuses.map(status => (
                <Badge
                  key={status}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => setSelectedStatuses(prev => prev.filter(s => s !== status))}
                >
                  {status} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content with Grid and Drawer */}
      <div className="relative">
        {/* Click-away overlay for drawer */}
        {selectedStartupId && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-25 md:hidden"
            onClick={handleClickAway}
          />
        )}

        {/* Startups Grid */}
        <div onClick={handleClickAway}>
          <StartupGrid
            startups={sortedStartups}
            showOwner={showOwner}
            onSelectStartup={handleStartupClick}
            selectedStartupId={selectedStartupId}
            className={selectedStartupId ? "lg:grid-cols-1" : ""}
          />
        </div>

        {/* Drawer */}
        {selectedStartupId && selectedStartup && (
          <StartupDetailDrawer
            startupId={selectedStartupId}
            startup={selectedStartup}
            canViewSensitiveData={selectedStartup.visibility === 'public' || selectedStartup.user_id === user?.id}
            onClose={() => setSelectedStartupId(null)}
          />
        )}
      </div>
    </div>
  )
})