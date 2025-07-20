import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  console.log('🔌 Creating Supabase browser client...')
  
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

  const client = createBrowserClient(supabaseUrl, supabaseKey)

  console.log('✅ Supabase browser client created successfully')
  return client
} 