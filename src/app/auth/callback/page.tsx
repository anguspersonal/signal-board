'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ensureUserProfile } from '@/lib/profile'
import { logger } from '@/lib/logger'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // First, check if user is already authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          logger.debug('User already authenticated, redirecting to dashboard')
          // Clean up the URL by removing query string before redirect
          window.history.replaceState(null, '', '/dashboard')
          router.replace('/dashboard')
          return
        }

        const code = searchParams.get('code')
        
        if (!code) {
          logger.debug('No authentication code found, redirecting to home')
          // Clean up the URL by removing query string before redirect
          window.history.replaceState(null, '', '/')
          router.replace('/')
          return
        }

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          logger.error('Auth callback error', { error })
          setError(error.message)
          setIsLoading(false)
          return
        }

        if (data.session) {
          logger.debug('Authentication successful')
          
          // Ensure user profile exists in public.users table
          if (data.session.user) {
            try {
              const profile = await ensureUserProfile(data.session.user)
              if (profile) {
                logger.debug('User profile ensured', { userId: data.session.user.id })
              } else {
                logger.warn('Failed to create user profile, but continuing with auth')
              }
            } catch (profileError) {
              logger.error('Error ensuring user profile', { error: profileError })
              // Don't fail the auth process if profile creation fails
              // The user can still use the app and create their profile later
            }
          }
          
          // Clean up the URL by removing query string before redirect
          window.history.replaceState(null, '', '/dashboard')
          // Redirect to dashboard page after successful authentication
          router.replace('/dashboard')
        } else {
          setError('No session created')
          setIsLoading(false)
        }
      } catch (err) {
        logger.error('Unexpected error during auth callback', { error: err })
        setError('An unexpected error occurred')
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Completing authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Failed</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Home
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 