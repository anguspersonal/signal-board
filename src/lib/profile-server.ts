import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User } from '@supabase/supabase-js'
import { logger } from './logger'

export interface UserProfile {
  id: string
  name: string | null
  profile_pic_url: string | null
  created_at: string
}

/**
 * Server-side version of getUserProfile that uses server client
 */
export async function getUserProfileServer(userId: string): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              logger.warn('Cookie setAll error in getUserProfileServer', error)
            }
          },
        },
      }
    )

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      logger.error('Error fetching user profile (server)', { userId, error })
      return null
    }

    return profile
  } catch (error) {
    logger.error('Unexpected error in getUserProfileServer', { userId, error })
    return null
  }
}

/**
 * Server-side version of ensureUserProfile that uses server client
 */
export async function ensureUserProfileServer(user: User): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              logger.warn('Cookie setAll error in ensureUserProfileServer', error)
            }
          },
        },
      }
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
      logger.error('Error creating user profile (server)', { userId: user.id, error: insertError })
      return null
    }

    logger.debug('Created new user profile (server)', { userId: user.id })
    return newProfile
  } catch (error) {
    logger.error('Unexpected error in ensureUserProfileServer', { userId: user.id, error })
    return null
  }
} 