'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface DrawerContextType {
  selectedStartupId: string | null
  setSelectedStartupId: (id: string | null) => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

interface DrawerProviderProps {
  children: ReactNode
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null)

  const handleSetSelectedStartupId = (id: string | null) => {
    console.log('DrawerProvider - setSelectedStartupId called with:', id)
    if (id === null) console.trace('Trace: Who called setSelectedStartupId(null)?')
    setSelectedStartupId(id)
  }

  // Debug logging for state changes - client-only
  useEffect(() => {
    console.log('DrawerProvider - selectedStartupId state:', selectedStartupId)
  }, [selectedStartupId])

  return (
    <DrawerContext.Provider value={{ selectedStartupId, setSelectedStartupId: handleSetSelectedStartupId }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider')
  }
  return context
} 