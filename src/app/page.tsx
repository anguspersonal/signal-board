'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, TrendingUp, Shield, Network } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Force light theme for this page
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Check if there's a code parameter in the URL (magic link)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          // Redirect to auth callback to handle the magic link
          router.replace(`/auth/callback?code=${code}`)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is authenticated, redirect to dashboard
          router.replace('/dashboard')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Handle magic link authentication
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(error.message)
        setMagicLinkSent(false)
      } else {
        setMessage('Check your email for a login link.')
        setMagicLinkSent(true)
        setEmail('')
      }
    } catch {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                Network-Driven
                <span className="text-blue-600"> Startup Discovery</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                A private platform for contributors, investors, and advisors to showcase 
                and discover promising startups through trusted networks.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Network Effects</h3>
                  <p className="text-sm text-slate-600">Follow trusted advisors and discover startups through your network</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">6D Framework</h3>
                  <p className="text-sm text-slate-600">Comprehensive evaluation across market, solution, team, and more</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Private & Secure</h3>
                  <p className="text-sm text-slate-600">Multi-tenant isolation with granular sharing controls</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Network className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Collaboration</h3>
                  <p className="text-sm text-slate-600">Share insights and collaborate with invited stakeholders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-slate-600">
                {isLogin 
                  ? 'Sign in to access your startup portfolio'
                  : 'Join the network of startup operators'
                }
              </p>
            </div>

            {magicLinkSent ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Check your email</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    We've sent a magic link to your email address. Click the link to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMagicLinkSent(false)
                      setMessage('')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Send another link
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required={!isLogin}
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Magic Link'}
                </Button>
              </form>
            )}

            {!magicLinkSent && (
              <div className="text-center">
                <span className="text-slate-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setMessage('')
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            )}

            {message && !magicLinkSent && (
              <div className="p-4 rounded-lg text-sm bg-red-50 text-red-700">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
