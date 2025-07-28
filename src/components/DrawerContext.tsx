'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface DrawerContextType {
  selectedStartupId: string | null
  setSelectedStartupId: (id: string | null) => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function DrawerProvider({ children }: { children: ReactNode }) {
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