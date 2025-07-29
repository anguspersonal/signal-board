'use client'

import { StartupCard } from './StartupCard'
import { StartupWithRatings } from '@/types/startup'
import { cn } from '@/lib/utils'

interface StartupGridProps {
  startups: StartupWithRatings[]
  showOwner?: boolean
  onSelectStartup?: (id: string) => void
  className?: string
}

export function StartupGrid({ 
  startups, 
  showOwner = false, 
  onSelectStartup,
  className 
}: StartupGridProps) {
  if (startups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No startups found</div>
        <p className="text-gray-400 mb-4">
          Be the first to add a startup to the platform
        </p>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300",
        className
      )}
    >
      {startups.map((startup) => (
        <div key={startup.id}>
          <StartupCard 
            startup={startup} 
            showOwner={showOwner}
            onClick={() => onSelectStartup?.(startup.id)}
          />
        </div>
      ))}
    </div>
  )
} 