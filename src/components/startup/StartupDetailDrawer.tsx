'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { StartupWithRatings } from '@/types/startup'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ArrowUpRightFromSquare } from 'lucide-react'
import { StartupDetailContent } from './StartupDetailContent'

interface StartupDetailDrawerProps {
  startupId: string
  startup: StartupWithRatings
  canViewSensitiveData: boolean
  onClose: () => void
}

export function StartupDetailDrawer({ 
  startupId,
  startup, 
  canViewSensitiveData,
  onClose
}: StartupDetailDrawerProps) {
  const router = useRouter()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleOpenFullPage = () => {
    router.push(`/startups/${startupId}`)
  }

  return (
    <div 
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full md:w-[480px] bg-white shadow-xl z-40 border-l border-gray-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {startup.logo_url && (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={startup.logo_url}
                  alt={startup.name ? `${startup.name} logo` : 'Startup logo'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 id="drawer-title" className="text-lg font-semibold text-slate-900 truncate">
                {startup.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={startup.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                  {startup.visibility === 'public' ? 'Public' : startup.visibility === 'invite-only' ? 'Invite Only' : 'Private'}
                </Badge>
                {startup.tags?.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
                {startup.tags && startup.tags.length > 3 && (
                  <Badge className="text-xs border">
                    +{startup.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleOpenFullPage} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Open full page"
            >
              <ArrowUpRightFromSquare className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <StartupDetailContent 
            startup={startup} 
            canViewSensitiveData={canViewSensitiveData} 
          />
        </div>
      </div>
    </div>
  )
} 