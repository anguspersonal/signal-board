import { redirect } from 'next/navigation'
import { getPageLayout, getAuthenticatedUser } from '@/lib/page-layout'
import { createClient } from '@/lib/supabase'
import { StartupEditForm } from './StartupEditForm'

type PageProps = {
  params?: Promise<{ id: string }>
}

export default async function EditStartupPage({ params }: PageProps) {
  const { id } = await params || { id: '' }

  // Get authenticated user and profile
  const { user, userProfile } = await getAuthenticatedUser()

  // Fetch startup data
  const supabase = await createClient()
  const { data: startup, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !startup) redirect('/startups')

  return getPageLayout(
    user,
    userProfile,
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Startup</h1>
        <p className="text-slate-600 mt-1">Update your startup information</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <StartupEditForm startup={startup} userId={user.id} />
      </div>
    </div>
  )
}
