'use client'

import { DrawerProvider } from '@/components/DrawerContext'
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="startin-theme"
    >
      <DrawerProvider>{children}</DrawerProvider>
    </ThemeProvider>
  )
} 