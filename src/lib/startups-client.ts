// startups-client.ts
// ✅ Use only in client-side ('use client') components
// 🚫 Do not import into page.tsx or server logic

import { createBrowserClient } from '@supabase/ssr'

export async function toggleStartupEngagementClient(
  startupId: string, 
  type: 'saved' | 'interest'
): Promise<boolean> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not authenticated')
    return false
  }

  // First, check if engagement already exists
  const { data: existingEngagement } = await supabase
    .from('startup_engagements')
    .select('id')
    .eq('startup_id', startupId)
    .eq('user_id', user.id)
    .eq('type', type)
    .single()

  if (existingEngagement) {
    // Remove existing engagement
    const { error } = await supabase
      .from('startup_engagements')
      .delete()
      .eq('id', existingEngagement.id)

    if (error) {
      console.error('Error removing startup engagement:', error)
      return false
    }

    return true
  } else {
    // Add new engagement
    const { error } = await supabase
      .from('startup_engagements')
      .insert({
        startup_id: startupId,
        user_id: user.id,
        type: type
      })

    if (error) {
      console.error('Error adding startup engagement:', error)
      return false
    }

    return true
  }
}

export async function getUserEngagementsClient(): Promise<{
  saved: string[]
  interested: string[]
}> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { saved: [], interested: [] }
  }

  const { data, error } = await supabase
    .from('startup_engagements')
    .select('startup_id, type')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching user engagements:', error)
    return { saved: [], interested: [] }
  }

  const saved = data?.filter(e => e.type === 'saved').map(e => e.startup_id) || []
  const interested = data?.filter(e => e.type === 'interest').map(e => e.startup_id) || []

  return { saved, interested }
} 