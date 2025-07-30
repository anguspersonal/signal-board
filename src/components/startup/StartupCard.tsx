'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { 
  MoreHorizontal, 
  Star, 
  MessageCircle, 
  Heart, 
  Bookmark, 
  Share2,
  Edit,
  Trash2,
  ExternalLink 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StartupWithRatings } from '@/types/startup'
import { toggleStartupEngagementClient } from '@/lib/startups-client'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getRatingColor, formatRating, getMockUser, cn } from '@/lib/utils'

interface StartupCardProps {
  startup: StartupWithRatings
  showOwner?: boolean
  onUpdate?: () => void
  onClick?: (id: string) => void
  selected?: boolean
}

export const StartupCard = memo(function StartupCard({ startup, showOwner = false, onUpdate, onClick, selected }: StartupCardProps) {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(getMockUser())
  const [loading, setLoading] = useState(false)
  const [localStartup, setLocalStartup] = useState(startup)
  const isDesktop = useMediaQuery('(min-width: 768px)')

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
      } catch {
        // console.error('Error getting user:', error)
      }
    }
    getUser()
  }, [])

  // Update local startup when prop changes
  useEffect(() => {
    setLocalStartup(startup)
  }, [startup])

  const isOwner = localStartup.user_id === user?.id

  const handleSaveToggle = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const success = await toggleStartupEngagementClient(localStartup.id, 'saved')
      if (success) {
        setLocalStartup(prev => ({
          ...prev,
          saved: !prev.saved
        }))
        onUpdate?.()
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !isOwner) return
    
    if (confirm('Are you sure you want to delete this startup?')) {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        onUpdate?.()
      } catch {
        // console.error('Error deleting startup:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(startup.id)
    } else if (isDesktop) {
      // Fallback to router navigation if no onClick provided
      router.push(`/startups/${startup.id}`)
    } else {
      router.push(`/startups/${startup.id}`)
    }
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-shadow duration-200 w-full hover:shadow-lg",
        {
          "ring-2 ring-blue-600": selected
        }
      )} 
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex gap-3 items-start">
          {/* Logo/Icon - Fixed width but responsive */}
          <div className="flex-shrink-0">
            {startup.logo_url ? (
              <Image 
                src={startup.logo_url} 
                alt={startup.name || 'Startup'}
                width={48}
                height={48}
                className="h-10 object-cover rounded-lg sm:h-12 sm:w-12 w-10"
                sizes="48px"
                priority={false}
              />
            ) : (
              <div className="bg-gradient-to-br flex from-blue-500 h-10 items-center justify-center rounded-lg sm:h-12 sm:w-12 to-purple-600 w-10">
                <span className="font-bold sm:text-lg text-sm text-white">
                  {(startup.name || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Title and Owner Info - Flexible width with proper truncation */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex gap-2 items-start justify-between">
              <CardTitle className="leading-tight text-base truncate sm:text-lg">
                {startup.name || 'Unnamed Startup'}
              </CardTitle>
              
              {/* Dropdown Menu - Fixed position, won't overflow */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="aria-label flex-shrink-0 h-8 p-0 w-8" 
                      aria-label="More options"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/startups/${startup.id}`)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {isOwner ? (
                      <>
                        <DropdownMenuItem onClick={() => router.push(`/startups/${startup.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={handleSaveToggle} disabled={loading}>
                        <Bookmark className={`fill-current mr-2 h-4 w-4 ${localStartup.saved ? '' : ''}`} />
                        {localStartup.saved ? 'Unsave' : 'Save'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {showOwner && startup.users && (
              <div className="flex gap-2 items-center mt-1">
                <Avatar className="flex-shrink-0 h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {startup.users.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-500 text-xs truncate">{startup.users.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-slate-600">
          {startup.summary || startup.description || 'No summary provided'}
        </p>

        {/* Status */}
        {startup.status && (
          <div className="flex gap-2 items-center">
            <StatusBadge status={startup.status} />
          </div>
        )}

        {startup.website_url && (
          <a
            href={startup.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="aria-label flex items-center hover:text-blue-700 text-blue-600 text-xs"
            aria-label={`Visit ${startup.name} website`}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="flex-shrink-0 mr-1 h-3 w-3" />
            <span className="truncate">Visit Website</span>
          </a>
        )}

        {/* Tags */}
        {startup.tags && startup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {startup.tags.slice(0, 3).map(tag => (
              <Badge key={tag} className="border text-xs">
                {tag}
              </Badge>
            ))}
            {startup.tags.length > 3 && (
              <Badge className="border text-xs">
                +{startup.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating and Action Buttons */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex flex-1 gap-2 items-center min-w-0">
            <Star className={`flex-shrink-0 h-4 w-4 ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`} />
            <span className={`font-medium text-sm truncate ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`}>
              {formatRating(startup.avg_rating)}
            </span>
            {startup.visibility === 'public' && (
              <span className="flex-shrink-0 text-slate-500 text-xs">
                ({startup.user_ratings?.length || 0} {startup.user_ratings?.length === 1 ? 'rating' : 'ratings'})
              </span>
            )}
          </div>

          <div className="flex flex-shrink-0 gap-1 items-center">
            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveToggle()
                }}
                disabled={loading}
                className="aria-label h-8 p-0 w-8"
                aria-label={localStartup.saved ? 'Unsave startup' : 'Save startup'}
              >
                <Bookmark className={`fill-current h-4 text-blue-600 w-4 ${localStartup.saved ? '' : 'text-slate-400'}`} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="aria-label h-8 p-0 w-8" 
              aria-label="Comment on startup"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-4 text-slate-400 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="aria-label h-8 p-0 w-8" 
              aria-label="Like startup"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-4 text-slate-400 w-4" />
            </Button>
          </div>
        </div>


      </CardContent>
    </Card>
  )
})