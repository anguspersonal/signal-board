import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from './logger'

export async function createClient() {
  logger.debug('Creating Supabase server client...')
  
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  logger.debug('Supabase environment variables found', {
    url: supabaseUrl,
    keyLength: supabaseKey.length
  })

  const client = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          logger.debug('Getting cookies', { count: allCookies.length })
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            logger.debug('Setting cookies', { count: cookiesToSet.length })
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            logger.warn('Cookie setAll error (expected in Server Components)', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  logger.debug('Supabase server client created successfully')
  return client
} 