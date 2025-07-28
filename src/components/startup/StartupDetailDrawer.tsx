'use client'

import React from 'react'
import { StartupWithRatings } from '@/types/startup'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StartupDetailContent } from './StartupDetailContent'

interface StartupDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  startup: StartupWithRatings
  canViewSensitiveData: boolean
}

export function StartupDetailDrawer({ 
  isOpen, 
  onClose, 
  startup, 
  canViewSensitiveData 
}: StartupDetailDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">{startup.name}</SheetTitle>
        </SheetHeader>
        <div className="pr-6">
          <StartupDetailContent 
            startup={startup} 
            canViewSensitiveData={canViewSensitiveData} 
          />
        </div>
      </SheetContent>
    </Sheet>
  )
} 