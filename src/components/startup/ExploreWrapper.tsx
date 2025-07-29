'use client'

import { ExploreGridClient } from './ExploreGridClient'
import { StartupWithRatings } from '@/types/startup'

interface ExploreWrapperProps {
  startups: StartupWithRatings[]
}

export function ExploreWrapper({ startups }: ExploreWrapperProps) {
  return (
    <ExploreGridClient 
      variant="explore" 
      startups={startups} 
      showOwner={true}
    />
  )
}