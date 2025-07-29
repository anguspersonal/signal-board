'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X, Search, Play, Pause, XCircle, CheckCircle, Package } from 'lucide-react'
import { memo } from 'react'

const PREDEFINED_STATUSES = [
  { 
    value: 'Discovery', 
    label: 'Discovery', 
    definition: 'Exploring the idea and market opportunity',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    value: 'Active', 
    label: 'Active', 
    definition: 'Currently working on and pursuing this startup',
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    value: 'Back-burner', 
    label: 'Back-burner', 
    definition: 'Paused temporarily but may resume later',
    icon: Pause,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  { 
    value: 'Not Pursuing', 
    label: 'Not Pursuing', 
    definition: 'Decided not to move forward with this startup',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  { 
    value: 'Exited', 
    label: 'Exited', 
    definition: 'Successfully sold, acquired, or IPO\'d',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    value: 'Archived', 
    label: 'Archived', 
    definition: 'Completed or closed down the startup',
    icon: Package,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
]

interface StatusSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const StatusSelect = memo(function StatusSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select status...",
  className = ""
}: StatusSelectProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [availableStatuses, setAvailableStatuses] = useState<typeof PREDEFINED_STATUSES>([...PREDEFINED_STATUSES])

  // Add custom status to the list
  const handleAddCustom = () => {
    if (customValue.trim() && !availableStatuses.some(s => s.value === customValue.trim())) {
      const newStatus = { 
        value: customValue.trim(), 
        label: customValue.trim(), 
        definition: 'Custom status',
        icon: Plus,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      }
      const newStatuses = [...availableStatuses, newStatus]
      setAvailableStatuses(newStatuses)
      onValueChange(customValue.trim())
      setCustomValue('')
      setIsAddingCustom(false)
    }
  }

  // Handle custom input key press
  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    } else if (e.key === 'Escape') {
      setIsAddingCustom(false)
      setCustomValue('')
    }
  }

  // Handle select change
  const handleSelectChange = (newValue: string) => {
    if (newValue === 'add-custom') {
      setIsAddingCustom(true)
    } else {
      onValueChange(newValue)
    }
  }

  return (
    <div className="space-y-2">
             <Select value={value} onValueChange={handleSelectChange}>
         <SelectTrigger className={`${className} h-20`}>
           <SelectValue placeholder={placeholder} />
         </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => {
            const IconComponent = status.icon
            return (
              <SelectItem key={status.value} value={status.value} className="py-3">
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-md ${status.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${status.color}`} />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className={`font-medium ${status.color}`}>{status.label}</span>
                    <span className="text-sm text-gray-500 mt-1">{status.definition}</span>
                  </div>
                </div>
              </SelectItem>
            )
          })}
          <SelectItem value="add-custom" className="text-blue-600">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add custom status
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {isAddingCustom && (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleCustomKeyPress}
            placeholder="Enter custom status"
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustom}
            disabled={!customValue.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAddingCustom(false)
              setCustomValue('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}) 