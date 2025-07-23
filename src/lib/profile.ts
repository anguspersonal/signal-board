import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { logger } from './logger'

export interface UserProfile {
  id: string
  name: string | null
  profile_pic_url: string | null
  created_at: string
}

/**
 * Ensures a user profile exists in the public.users table
 * Creates a new profile if one doesn't exist
 */
export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('Error checking existing user profile', { userId: user.id, error: fetchError })
      return null
    }

    if (existingProfile) {
      logger.debug('User profile already exists', { userId: user.id })
      return existingProfile
    }

    // Generate a fallback name from email if no name is provided
    const generateFallbackName = (email: string | undefined): string => {
      if (!email) return 'User'
      const emailPart = email.split('@')[0]
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
    }

    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    generateFallbackName(user.email)

    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: userName,
        profile_pic_url: user.user_metadata?.avatar_url || null,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error creating user profile', { userId: user.id, error: insertError })
      return null
    }

    logger.debug('Created new user profile', { userId: user.id })
    return newProfile
  } catch (error) {
    logger.error('Unexpected error in ensureUserProfile', { userId: user.id, error })
    return null
  }
}

/**
 * Updates a user's profile information
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<UserProfile, 'name' | 'profile_pic_url'>>
): Promise<UserProfile | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating user profile', { userId, error })
      return null
    }

    return updatedProfile
  } catch (error) {
    logger.error('Unexpected error in updateUserProfile', { userId, error })
    return null
  }
}

/**
 * Gets a display name for a user, with fallback logic
 * This ensures no null names are displayed in the UI
 */
export function getDisplayName(profile: UserProfile | null, userEmail?: string): string {
  if (profile?.name) {
    return profile.name
  }
  
  // Fallback to email-based name
  if (userEmail) {
    const emailPart = userEmail.split('@')[0]
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
  }
  
  return 'User'
}

/**
 * Fetches a user's profile by ID (client-side)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      logger.error('Error fetching user profile', { userId, error })
      return null
    }

    return profile
  } catch (error) {
    logger.error('Unexpected error in getUserProfile', { userId, error })
    return null
  }
}

 