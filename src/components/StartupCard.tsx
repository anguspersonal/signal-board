'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface StartupWithRatings {
  id: string
  user_id: string
  name?: string
  description?: string
  tags: string[]
  logo_url: string
  website_url: string
  visibility: 'private' | 'invite-only' | 'public'
  created_at: string
  updated_at: string
  avg_rating?: number
  user_ratings?: Array<{ id: string; rating: number; comment?: string; user_id: string }>
  saved?: boolean
  users?: { name: string; email: string }
}

interface StartupCardProps {
  startup: StartupWithRatings
  showOwner?: boolean
  onUpdate?: () => void
}

export function StartupCard({ startup, showOwner = false, onUpdate }: StartupCardProps) {
  const router = useRouter()
  const user = { id: '1' } // Mock user
  const [loading, setLoading] = useState(false)

  const isOwner = startup.user_id === user?.id

  const handleSaveToggle = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onUpdate?.()
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
      } catch (error) {
        console.error('Error deleting startup:', error)
      } finally {
        setLoading(false)
      }
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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {startup.logo_url ? (
              <Image 
                src={startup.logo_url} 
                alt={startup.name || 'Startup'}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {(startup.name || 'S').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{startup.name || 'Unnamed Startup'}</CardTitle>
              {showOwner && startup.users && (
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-xs">
                      {startup.users.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-500">{startup.users.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  <Bookmark className={`mr-2 h-4 w-4 ${startup.saved ? 'fill-current' : ''}`} />
                  {startup.saved ? 'Unsave' : 'Save'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {startup.description || 'No description provided'}
        </p>

        {startup.website_url && (
          <a
            href={startup.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visit Website
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

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`} />
            <span className={`text-sm font-medium ${startup.avg_rating ? getRatingColor(startup.avg_rating) : 'text-slate-400'}`}>
              {formatRating(startup.avg_rating)}
            </span>
            <span className="text-xs text-slate-500">
              ({startup.user_ratings?.length || 0} {startup.user_ratings?.length === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Bookmark className={`h-4 w-4 ${startup.saved ? 'fill-current text-blue-600' : 'text-slate-400'}`} />
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
          onClick={() => router.push(`/startups/${startup.id}`)}
          variant="outline"
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
} 