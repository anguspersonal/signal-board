'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

interface StartupCardProps {
  startup: StartupWithRatings
  showOwner?: boolean
  onUpdate?: () => void
  onClick?: () => void
}

export function StartupCard({ startup, showOwner = false, onUpdate, onClick }: StartupCardProps) {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
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
      onClick()
    } else if (isDesktop) {
      // Fallback to router navigation if no onClick provided
      router.push(`/startups/${startup.id}`)
    } else {
      router.push(`/startups/${startup.id}`)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatRating = (rating?: number) => {
    if (!rating) return 'Not rated'
    return rating.toFixed(1)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 w-full cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Logo/Icon - Fixed width but responsive */}
          <div className="flex-shrink-0">
            {startup.logo_url ? (
              <Image 
                src={startup.logo_url} 
                alt={startup.name || 'Startup'}
                width={48}
                height={48}
                className="rounded-lg object-cover w-10 h-10 sm:w-12 sm:h-12"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {(startup.name || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Title and Owner Info - Flexible width with proper truncation */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base sm:text-lg truncate leading-tight">
                {startup.name || 'Unnamed Startup'}
              </CardTitle>
              
              {/* Dropdown Menu - Fixed position, won't overflow */}
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
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
                        <Bookmark className={`mr-2 h-4 w-4 ${localStartup.saved ? 'fill-current' : ''}`} />
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
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-4 w-4 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {startup.users.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-500 truncate">{startup.users.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {startup.summary || startup.description || 'No summary provided'}
        </p>

        {/* Status */}
        {startup.status && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {startup.status}
            </Badge>
          </div>
        )}

        {startup.website_url && (
          <a
            href={startup.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Visit Website</span>
          </a>
        )}

        {/* Tags */}
        {startup.tags && startup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {startup.tags.slice(0, 3).map(tag => (
              <Badge key={tag} className="text-xs border">
                {tag}
              </Badge>
            ))}
            {startup.tags.length > 3 && (
              <Badge className="text-xs border">
                +{startup.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating and Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Star className={`h-4 w-4 flex-shrink-0 ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`} />
            <span className={`text-sm font-medium truncate ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`}>
              {formatRating(startup.avg_rating)}
            </span>
            {startup.visibility === 'public' && (
              <span className="text-xs text-slate-500 flex-shrink-0">
                ({startup.user_ratings?.length || 0} {startup.user_ratings?.length === 1 ? 'rating' : 'ratings'})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Bookmark className={`h-4 w-4 ${localStartup.saved ? 'fill-current text-blue-600' : 'text-slate-400'}`} />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageCircle className="h-4 w-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={(e) => {
            e.stopPropagation()
            if (onClick) {
              onClick()
            } else {
              router.push(`/startups/${startup.id}`)
            }
          }}
          variant="outline"
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
} 