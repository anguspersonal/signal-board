'use client'

import { Badge } from '@/components/ui/badge'
import { Search, Play, Pause, XCircle, CheckCircle, Package, Plus } from 'lucide-react'
import { memo } from 'react'

const PREDEFINED_STATUSES = [
  { 
    value: 'Discovery', 
    label: 'Discovery', 
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    value: 'Active', 
    label: 'Active', 
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  { 
    value: 'Back-burner', 
    label: 'Back-burner', 
    icon: Pause,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  { 
    value: 'Not Pursuing', 
    label: 'Not Pursuing', 
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  { 
    value: 'Exited', 
    label: 'Exited', 
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    value: 'Archived', 
    label: 'Archived', 
    icon: Package,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
]

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  className?: string
}

export const StatusBadge = memo(function StatusBadge({ status, showIcon = true, className = "" }: StatusBadgeProps) {
  if (!status) return null

  // Find the predefined status or create a default one
  const statusConfig = PREDEFINED_STATUSES.find(s => s.value === status) || {
    value: status,
    label: status,
    icon: Plus,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }

  const renderIcon = () => {
    if (!showIcon) return null
    
    switch (statusConfig.icon) {
      case Search:
        return <Search className="h-3 w-3 mr-1" />
      case Play:
        return <Play className="h-3 w-3 mr-1" />
      case Pause:
        return <Pause className="h-3 w-3 mr-1" />
      case XCircle:
        return <XCircle className="h-3 w-3 mr-1" />
      case CheckCircle:
        return <CheckCircle className="h-3 w-3 mr-1" />
      case Package:
        return <Package className="h-3 w-3 mr-1" />
      case Plus:
      default:
        return <Plus className="h-3 w-3 mr-1" />
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color} border ${className}`}
    >
      {renderIcon()}
      {statusConfig.label}
    </Badge>
  )
})