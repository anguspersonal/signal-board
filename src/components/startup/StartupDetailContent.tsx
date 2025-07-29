'use client'

import React, { useState, useEffect } from 'react'
import { StartupWithRatings } from '@/types/startup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MessageCircle, Heart, Share2, ExternalLink, Edit, Bookmark } from 'lucide-react'
import Image from 'next/image'
import { toggleStartupEngagementClient } from '@/lib/startups-client'
import { StartupRatingForm } from '@/components/StartupRatingForm'
import ReactMarkdown from 'react-markdown'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface StartupDetailContentProps {
  startup: StartupWithRatings
  canViewSensitiveData: boolean
}

export function StartupDetailContent({ startup, canViewSensitiveData }: StartupDetailContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [localStartup, setLocalStartup] = useState(startup)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [showRatingForm, setShowRatingForm] = useState(false)

  // Get the authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
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

  const handleSaveToggle = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const success = await toggleStartupEngagementClient(startup.id, 'saved')
      if (success) {
        setLocalStartup(prev => ({
          ...prev,
          saved: !prev.saved
        }))
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterestToggle = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const success = await toggleStartupEngagementClient(startup.id, 'interest')
      if (success) {
        setLocalStartup(prev => ({
          ...prev,
          interested: !prev.interested
        }))
      }
    } catch (error) {
      console.error('Error toggling interest:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: startup.name,
          text: startup.description || `Check out ${startup.name} on StartIn`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // You could add a toast notification here
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  const handleRatingSubmitted = () => {
    setShowRatingForm(false)
    // Refresh the page to show updated ratings
    window.location.reload()
  }

  const handleEdit = () => {
    window.location.href = `/startups/${startup.id}/edit`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {startup.logo_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={startup.logo_url}
                alt={`${startup.name} logo`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                sizes="64px"
                priority={false}
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{startup.name}</h1>
              <Badge variant={startup.visibility === 'public' ? 'default' : 'secondary'}>
                {startup.visibility === 'public' ? 'Public' : startup.visibility === 'invite-only' ? 'Invite Only' : 'Private'}
              </Badge>
            </div>
            <p className="text-slate-600 mt-1">
              Created by {startup.creator_name}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Edit button - only show if user is the creator */}
          {user && startup.user_id === user.id && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              <span className="md:hidden truncate">Edit</span>
              <span className="hidden md:inline truncate">Edit</span>
            </Button>
          )}
          {user && (
            <>
              <Button 
                variant={localStartup.saved ? "default" : "outline"} 
                size="sm"
                onClick={handleSaveToggle}
                disabled={isLoading}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${localStartup.saved ? 'fill-current' : ''}`} />
                <span className="md:hidden truncate">{localStartup.saved ? 'Saved' : 'Save'}</span>
                <span className="hidden md:inline truncate">{localStartup.saved ? 'Saved' : 'Save'}</span>
              </Button>
              <Button 
                variant={localStartup.interested ? "default" : "outline"} 
                size="sm"
                onClick={handleInterestToggle}
                disabled={isLoading}
              >
                <MessageCircle className={`w-4 h-4 mr-2 ${localStartup.interested ? 'fill-current' : ''}`} />
                <span className="md:hidden truncate">{localStartup.interested ? 'Interested' : 'Interest'}</span>
                <span className="hidden md:inline truncate">{localStartup.interested ? 'Interested' : 'Express Interest'}</span>
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            <span className="md:hidden truncate">Share</span>
            <span className="hidden md:inline truncate">Share</span>
          </Button>
          {startup.website_url && (
            <a 
              href={startup.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 px-3 text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      {startup.tags && startup.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {startup.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Summary */}
      {startup.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{startup.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {startup.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none prose-slate">
              <ReactMarkdown>
                {startup.description}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status and Opportunities - Show if user has access */}
      {(startup.status || startup.asks_and_opportunities) && canViewSensitiveData && (
        <Card>
          <CardHeader>
            <CardTitle>Status & Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {startup.status && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Current Status</h4>
                <StatusBadge status={startup.status} />
              </div>
            )}
            {startup.asks_and_opportunities && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Asks & Opportunities</h4>
                <p className="text-slate-700 whitespace-pre-wrap">{startup.asks_and_opportunities}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Involvement - Only show if user is the creator */}
      {user && startup.user_id === user.id && startup.status && (
        <Card>
          <CardHeader>
            <CardTitle>Your Involvement</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={startup.status} />
          </CardContent>
        </Card>
      )}

      {/* Ratings - Only show if user has access to sensitive data */}
      {canViewSensitiveData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Ratings
                {startup.avg_rating && (
                  <span className="ml-2 text-lg font-semibold text-slate-900">
                    {startup.avg_rating.toFixed(1)}/5
                  </span>
                )}
              </div>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRatingForm(!showRatingForm)}
                >
                  <span className="md:hidden truncate">{showRatingForm ? 'Cancel' : 'Rate'}</span>
                  <span className="hidden md:inline truncate">{showRatingForm ? 'Cancel' : 'Rate Startup'}</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showRatingForm && user && (
              <div className="mb-6">
                <StartupRatingForm
                  startupId={startup.id}
                  userId={user.id}
                  onRatingSubmitted={handleRatingSubmitted}
                />
              </div>
            )}
            
            {startup.user_ratings && startup.user_ratings.length > 0 ? (
              <div className="space-y-4">
                {startup.user_ratings.map((rating) => (
                  <div key={rating.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`${rating.id}-star-${i}`}
                              className={`w-4 h-4 ${
                                i < rating.score ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">
                          {rating.score}/5 - {rating.dimension}
                        </span>
                        {rating.visibility && (
                          <Badge 
                            variant={rating.visibility === 'public' ? 'default' : rating.visibility === 'private' ? 'secondary' : 'outline'}
                            className="ml-2 text-xs"
                            title={
                              rating.visibility === 'public' ? 'Visible to everyone' :
                              rating.visibility === 'private' ? 'Only visible to you' :
                              'Visible to users with special access'
                            }
                          >
                            {rating.visibility === 'public' ? 'Public' :
                             rating.visibility === 'private' ? 'Private' :
                             'Inner Circle'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-slate-700 text-sm">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No ratings yet</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments - Only show if user has access to sensitive data */}
      {canViewSensitiveData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-center py-8">Comments feature coming soon</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 text-center py-8">
              This startup is private. Only the owner and invited users can view comments and ratings.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Bookmark className={`w-5 h-5 ${localStartup.saved ? 'text-blue-500 fill-current' : 'text-gray-400'}`} />
                  <span className="text-sm text-slate-600">
                    {localStartup.saved ? 'You saved this startup' : 'Not saved'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className={`w-5 h-5 ${localStartup.interested ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  <span className="text-sm text-slate-600">
                    {localStartup.interested ? 'You expressed interest' : 'No interest expressed'}
                  </span>
                </div>
              </div>
            )}
            <div className="text-sm text-slate-500">
              <p>Engagement metrics and analytics coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 