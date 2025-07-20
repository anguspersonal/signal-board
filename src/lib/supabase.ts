import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  console.log('🔌 Creating Supabase server client...')
  
  const cookieStore = await cookies()
  console.log('🍪 Cookie store initialized')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables:')
    console.error('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('  Key:', supabaseKey ? '✅ Set' : '❌ Missing')
    throw new Error('Missing Supabase environment variables')
  }

  console.log('✅ Supabase environment variables found')
  console.log('  URL:', supabaseUrl)
  console.log('  Key length:', supabaseKey.length)

  const client = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('🍪 Getting cookies:', allCookies.length, 'cookies found')
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            console.log('🍪 Setting cookies:', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              console.log(`  🍪 Set cookie: ${name}`)
            })
          } catch (error) {
            console.warn('⚠️ Cookie setAll error (expected in Server Components):', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  console.log('✅ Supabase server client created successfully')
  return client
} 