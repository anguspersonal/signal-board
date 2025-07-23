import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUserProfileServer } from '@/lib/profile-server'
import { AppLayout } from '@/components/AppLayout'
import { Navigation } from '@/components/Navigation'
import { SideNavigation } from '@/components/SideNavigation'
import { StartupEditForm } from './StartupEditForm'


type PageProps = {
  params?: { id: string }
}

export default async function EditStartupPage({ params = { id: '' } }: PageProps) {
  const { id } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const userProfile = await getUserProfileServer(user.id)

  const { data: startup, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !startup) redirect('/startups')

  return (
    <AppLayout
      navigation={<Navigation user={user} userProfile={userProfile} />}
      sideNavigation={<SideNavigation />}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Startup</h1>
          <p className="text-slate-600 mt-1">Update your startup information</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <StartupEditForm startup={startup} userId={user.id} />
        </div>
      </div>
    </AppLayout>
  )
}
