'use client'

import { StartupsClient } from './StartupsClient'
import { StartupWithRatings } from '@/types/startup'

interface StartupsWrapperProps {
  startups: StartupWithRatings[]
}

export function StartupsWrapper({ startups }: StartupsWrapperProps) {
  return (
    <StartupsClient 
      variant="explore" 
      startups={startups} 
      showOwner={true}
    />
  )
} 