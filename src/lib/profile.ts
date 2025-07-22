import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  name: string | null
  profile_pic_url: string | null
  created_at: string
}

/**
 * Creates a user profile in the public.users table if it doesn't exist
 * This should be called after successful authentication
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
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing profile:', fetchError)
      return null
    }

    if (existingProfile) {
      console.log('User profile already exists:', existingProfile)
      return existingProfile
    }

    // Generate fallback name from email or use default
    const generateFallbackName = (email: string | undefined): string => {
      if (!email) return 'New User'
      const emailPart = email.split('@')[0]
      // Capitalize first letter and handle common email patterns
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
    }

    // Determine the name to use, with explicit fallback logic
    const userName = user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    generateFallbackName(user.email)

    console.log('Profile creation - User metadata:', user.user_metadata)
    console.log('Profile creation - Determined name:', userName)

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
      console.error('Error creating user profile:', insertError)
      return null
    }

    console.log('Created new user profile:', newProfile)
    return newProfile
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error)
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
      console.error('Error updating user profile:', error)
      return null
    }

    return updatedProfile
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error)
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
 * Fetches a user's profile by ID
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
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error)
    return null
  }
} 