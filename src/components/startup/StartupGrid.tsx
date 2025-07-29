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
      <div className="py-12 text-center">
        <div className="mb-2 text-lg text-gray-500">No startups found</div>
        <p className="mb-4 text-gray-400">
          Be the first to add a startup to the platform
        </p>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 transition-all duration-300",
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