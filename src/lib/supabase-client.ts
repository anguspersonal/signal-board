import { createBrowserClient } from '@supabase/ssr'
import { logger } from './logger'

export function createBrowserSupabaseClient() {
  // logger.debug('Creating Supabase browser client...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  // logger.debug('Supabase environment variables found', {
  //   url: supabaseUrl,
  //   keyLength: supabaseKey.length
  // })

  const client = createBrowserClient(supabaseUrl, supabaseKey)

  // logger.debug('Supabase browser client created successfully')
  return client
} 