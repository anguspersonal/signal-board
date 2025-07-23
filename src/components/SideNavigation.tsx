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

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Activity Feed', href: '/feed', icon: Activity },
  { name: 'Network', href: '/network', icon: Users },
  { name: 'My Startups', href: '/startups', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function SideNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="flex justify-end p-4 border-b border-gray-200">
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

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10",
                isActive && "bg-blue-50 text-blue-700 border-blue-200",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className={cn(
                "h-4 w-4",
                isCollapsed ? "mr-0" : "mr-3"
              )} />
              {!isCollapsed && (
                <span className="flex-1 text-left">{item.name}</span>
              )}
              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Collapsed Tooltips */}
      {isCollapsed && (
        <div className="absolute left-16 top-0 z-50">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <div
                key={item.name}
                className={cn(
                  "bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive && "bg-blue-600"
                )}
                style={{ 
                  top: `${navigationItems.indexOf(item) * 56 + 80}px`,
                  pointerEvents: 'none'
                }}
              >
                {item.name}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 