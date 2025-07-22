'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { getUserProfile, updateUserProfile, ensureUserProfile, getDisplayName, UserProfile } from '@/lib/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Globe, 
  Briefcase, 
  Calendar,
  Edit3,
  Save,
  X,
  Activity,
  AlertCircle
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  
  // Extended user data for display
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    joinedDate: '',
    avatar_url: null as string | null
  })

  const [editData, setEditData] = useState({ ...userData })

  // Check if user has a default/generated name
  const hasDefaultName = (profile: UserProfile | null, email?: string): boolean => {
    if (!profile?.name) return true
    if (!email) return true
    
    const emailPart = email.split('@')[0]
    const defaultName = emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
    
    return profile.name === defaultName || profile.name === 'New User'
  }

  // Load user and profile data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
          return
        }

        setUser(user)

        // Load user profile
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)

        // Set user data for display
                 setUserData({
           name: profile?.name || '',
           email: user.email || '',
           bio: '', // Not in our current schema, but could be added
           location: '', // Not in our current schema, but could be added
           website: '', // Not in our current schema, but could be added
           company: '', // Not in our current schema, but could be added
           joinedDate: profile?.created_at || '',
           avatar_url: profile?.profile_pic_url || null
         })

                 setEditData({
           name: profile?.name || '',
           email: user.email || '',
           bio: '',
           location: '',
           website: '',
           company: '',
           joinedDate: profile?.created_at || '',
           avatar_url: profile?.profile_pic_url || null
         })
      } catch (error) {
        console.error('Error loading user data:', error)
        setError('Failed to load user data')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSave = async () => {
    if (!user) {
      setError('User not found')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Update the profile in the database
      const updatedProfile = await updateUserProfile(user.id, {
        name: editData.name || null,
        profile_pic_url: editData.avatar_url
      })

      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setUserData({ ...editData })
        setIsEditing(false)
        setSuccess('Profile updated successfully!')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({ ...userData })
    setIsEditing(false)
    setError('')
  }

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Show loading state while fetching profile data
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show profile creation prompt if no profile exists
  if (!userProfile && user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">Complete Your Profile</h2>
              <p className="text-muted-foreground mb-6">
                Welcome to StartIn! Let's set up your profile to get started.
              </p>
              <Button 
                onClick={async () => {
                  if (user) {
                    const newProfile = await ensureUserProfile(user)
                    if (newProfile) {
                      setUserProfile(newProfile)
                      setUserData(prev => ({
                        ...prev,
                        name: newProfile.name || '',
                        joinedDate: newProfile.created_at
                      }))
                      setEditData(prev => ({
                        ...prev,
                        name: newProfile.name || '',
                        joinedDate: newProfile.created_at
                      }))
                    }
                  }
                }}
                className="w-full"
              >
                Set Up Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Default Name Alert */}
        {userProfile && hasDefaultName(userProfile, user?.email) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm mt-1">
                  We've generated a name from your email. Please update it to your real name for a better experience.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="startups">My Startups</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your personal information and bio
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                      {getDisplayName(userProfile, user?.email).split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-foreground">{userData.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={editData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <p className="text-foreground">{userData.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      ) : (
                        <p className="text-foreground">{userData.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                        />
                      ) : (
                        <div className="flex items-center text-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {userData.location}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={editData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      ) : (
                        <div className="flex items-center text-foreground">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a 
                            href={userData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {userData.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Enter your company"
                        />
                      ) : (
                        <div className="flex items-center text-foreground">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          {userData.company}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member Since
                      </label>
                      <div className="flex items-center text-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(userData.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="startups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Startups</CardTitle>
                <CardDescription>
                  Startups you've created or are associated with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No startups found</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/startups/new')}
                  >
                    Create Your First Startup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent actions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 