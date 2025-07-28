'use client'

import React from 'react'
import { StartupWithRatings } from '@/types/startup'
import { StartupDetailContent } from '@/components/startup/StartupDetailContent'

interface StartupDetailViewProps {
  startup: StartupWithRatings
  canViewSensitiveData: boolean
}

export function StartupDetailView({ startup, canViewSensitiveData }: StartupDetailViewProps) {
  return (
    <StartupDetailContent 
      startup={startup} 
      canViewSensitiveData={canViewSensitiveData} 
    />
  )
} 