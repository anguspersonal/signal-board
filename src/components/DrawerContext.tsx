'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

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

  return (
    <DrawerContext.Provider value={{ selectedStartupId, setSelectedStartupId }}>
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