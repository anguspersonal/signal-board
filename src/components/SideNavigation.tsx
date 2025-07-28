'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Building2, 
  Activity, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useDrawer } from './DrawerContext'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Startups', href: '/startups', icon: Building2 },
  { name: 'Activity Feed', href: '/feed', icon: Activity },
  { name: 'Network', href: '/network', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SideNavigationProps {
  forceCollapsed?: boolean
}

export function SideNavigation({ forceCollapsed = false }: SideNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { selectedStartupId } = useDrawer()

  // Use forceCollapsed if provided, otherwise use local state
  // Also collapse when a startup is selected (drawer is open)
  const shouldCollapse = forceCollapsed || isCollapsed || !!selectedStartupId

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      shouldCollapse ? "w-16" : "w-64"
    )}>
      {/* Toggle Button - Only show when not force collapsed and no startup selected */}
      {!forceCollapsed && !selectedStartupId && (
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav role="navigation" aria-label="Main" className="p-4 space-y-2">
        {navigationItems.map((item, i) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <div key={item.name} className="group relative">
              <div className="group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10",
                    isActive && "bg-blue-50 text-blue-700 border-blue-200",
                    shouldCollapse && "justify-center px-2"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    shouldCollapse ? "mr-0" : "mr-3"
                  )} />
                  {!shouldCollapse && (
                    <span className="flex-1 text-left truncate whitespace-nowrap">{item.name}</span>
                  )}
                  {item.badge && !shouldCollapse && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </div>
              {shouldCollapse && (
                <div
                  className={cn(
                    "absolute left-full ml-2 bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive && "bg-blue-600"
                  )}
                  style={{ 
                    // Position tooltip vertically aligned with nav item (56px per item + 80px offset)
                    top: `${i * 56 + 80}px`,
                    pointerEvents: 'none'
                  }}
                >
                  {item.name}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
} 