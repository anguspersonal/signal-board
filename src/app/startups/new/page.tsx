import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { StartupForm } from './StartupForm'

export default async function NewStartupPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Startup</h1>
            <p className="text-slate-600 mt-1">
              Share your startup with the community for evaluation and feedback
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <StartupForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
} 