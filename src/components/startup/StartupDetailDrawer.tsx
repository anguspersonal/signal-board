'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { StartupWithRatings } from '@/types/startup'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ArrowUpRightFromSquare, ArrowLeft } from 'lucide-react'
import { StartupDetailContent } from './StartupDetailContent'
import { useDrawer } from '@/components/DrawerContext'

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
  const { setSelectedStartupId } = useDrawer()

  // Debug logging
  console.log('StartupDetailDrawer - startupId:', startupId)
  console.log('StartupDetailDrawer - startup:', startup)
  console.log('StartupDetailDrawer - canViewSensitiveData:', canViewSensitiveData)

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
      className="fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full overflow-hidden border-l border-gray-200 bg-white shadow-xl md:w-[480px]"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Top-left arrow button */}
      <button
        onClick={() => setSelectedStartupId(null)}
        className="absolute left-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none"
        aria-label="Close Drawer"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600" />
      </button>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {startup.logo_url && (
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={startup.logo_url}
                  alt={startup.name ? `${startup.name} logo` : 'Startup logo'}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
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
              <ArrowUpRightFromSquare className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
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