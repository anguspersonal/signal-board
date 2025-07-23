import React from 'react'
import { createClient } from '@/lib/supabase'
import { getUserProfileServer, UserProfile } from '@/lib/profile-server'
import { AppLayout } from '@/components/AppLayout'
import { Navigation } from '@/components/Navigation'
import { SideNavigation } from '@/components/SideNavigation'
import { redirect } from 'next/navigation'

interface User {
  id: string
  email?: string
}

interface PageLayoutOptions {
  requireAuth?: boolean
  fetchUserProfile?: boolean
}

/**
 * Helper function to get the standard page layout with authentication and navigation
 * @param user - The authenticated user object
 * @param userProfile - The user profile object (optional if fetchUserProfile is true)
 * @param children - The page content to render
 * @param options - Optional configuration for authentication and profile fetching
 * @returns The page wrapped in AppLayout with Navigation and SideNavigation
 */
export async function getPageLayout(
  user: User | null,
  userProfile: UserProfile | null,
  children: React.ReactNode,
  options: PageLayoutOptions = {}
): Promise<React.ReactElement> {
  const { requireAuth = true, fetchUserProfile = false } = options

  // Handle authentication
  if (requireAuth && !user) {
    redirect('/')
  }

  // Fetch user profile if requested and not provided
  let finalUserProfile = userProfile
  if (fetchUserProfile && user && !userProfile) {
    finalUserProfile = await getUserProfileServer(user.id)
  }

  // eslint-disable-next-line react/no-children-prop
  return React.createElement(AppLayout, {
    navigation: React.createElement(Navigation, { user, userProfile: finalUserProfile }),
    sideNavigation: React.createElement(SideNavigation),
    children // ✅ explicitly included
  })
  
}

/**
 * Helper function to get authenticated user and profile
 * @returns Object containing user and userProfile
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  const userProfile = await getUserProfileServer(user.id)
  
  return { user, userProfile }
} 