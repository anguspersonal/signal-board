'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StartupBase } from '@/types/startup'
import UploadLogo from '@/components/ui/UploadLogo'
import { StatusSelect } from '@/components/ui/StatusSelect'

export function StartupEditForm({ 
  startup, 
  userId 
}: {
  startup: StartupBase
  userId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(startup.logo_url || null)
  const [logoPath, setLogoPath] = useState<string | null>(null)
  const [oldLogoPath, setOldLogoPath] = useState<string | null>(null)
  const [isLogoUploaded, setIsLogoUploaded] = useState(false) // Track if logo was uploaded in this session
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    tags: '',
    logo_url: '',
    website_url: '',
    visibility: 'public' as 'public' | 'invite-only' | 'private',
    status: '',
    asks_and_opportunities: ''
  })

  // Extract old logo path from current logo URL for cleanup
  useEffect(() => {
    if (startup.logo_url) {
      // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/startup-logos/startupId/filename
      const urlParts = startup.logo_url.split('/')
      const startupLogosIndex = urlParts.findIndex(part => part === 'startup-logos')
      if (startupLogosIndex !== -1 && urlParts.length > startupLogosIndex + 2) {
        const path = urlParts.slice(startupLogosIndex + 1).join('/')
        setOldLogoPath(path)
      }
    }
  }, [startup.logo_url])

  // Cleanup function to delete uploaded files if form is abandoned
  // ONLY for files that were uploaded but not yet saved to database
  const cleanupUploadedFiles = useCallback(async () => {
    // Only cleanup if we have a logoPath AND the logo hasn't been successfully uploaded/saved
    // For existing startups, we don't want to delete files that were successfully uploaded
    if (logoPath && !isLogoUploaded) {
      console.log('Cleaning up unsaved uploaded file:', logoPath)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      try {
        await supabase.storage
          .from('startup-logos')
          .remove([logoPath])
        console.log('Successfully cleaned up unsaved file')
      } catch (err) {
        console.error('Error cleaning up uploaded files:', err)
      }
    }
  }, [logoPath, isLogoUploaded])

  // Cleanup on component unmount or when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupUploadedFiles()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cleanupUploadedFiles()
    }
  }, [cleanupUploadedFiles])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupUploadedFiles()
    }
  }, [cleanupUploadedFiles])

  const handleCancel = async () => {
    await cleanupUploadedFiles()
    router.push(`/startups/${startup.id}`)
  }

  // Initialize form data with startup data
  useEffect(() => {
    setFormData({
      name: startup.name || '',
      summary: startup.summary || '',
      description: startup.description || '',
      tags: startup.tags ? startup.tags.join(', ') : '',
      logo_url: startup.logo_url || '',
      website_url: startup.website_url || '',
      visibility: startup.visibility || 'public',
      status: startup.status || '',
      asks_and_opportunities: startup.asks_and_opportunities || ''
    })
  }, [startup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Startup name is required')
      setIsLoading(false)
      return
    }

    if (!formData.summary.trim()) {
      setError('Startup summary is required')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error: updateError } = await supabase
        .from('startups')
        .update({
          name: formData.name.trim(),
          summary: formData.summary.trim() || null,
          description: formData.description.trim() || null,
          tags: tags.length > 0 ? tags : null,
          logo_url: logoUrl || formData.logo_url.trim() || null,
          website_url: formData.website_url.trim() || null,
          visibility: formData.visibility,
          status: formData.status.trim() || null,
          asks_and_opportunities: formData.asks_and_opportunities.trim() || null
        })
        .eq('id', startup.id)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating startup:', updateError)
        setError(updateError.message || 'Failed to update startup')
        return
      }

      // Mark logo as successfully uploaded and saved
      if (logoPath) {
        setIsLogoUploaded(true)
        console.log('Logo successfully saved to database, marking as uploaded')
      }

      // Redirect to the startup's page
      router.push(`/startups/${startup.id}`)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpload = async (url: string, path?: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Only update database if we have a valid URL (not empty string from logo removal)
    if (url) {
      console.log('Saving logo URL to database:', url)
      const { error } = await supabase
        .from('startups')
        .update({ logo_url: url })
        .eq('id', startup.id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to save logo URL:', error)
        setError('Failed to save logo URL. Please try again.')
        return
      }

      console.log('Logo URL successfully saved to database')

      // Clean up old logo file if it exists and is different from the new one
      if (oldLogoPath && oldLogoPath !== path) {
        try {
          console.log('Cleaning up old logo file:', oldLogoPath)
          const { error: deleteError } = await supabase.storage
            .from('startup-logos')
            .remove([oldLogoPath])

          if (deleteError) {
            console.error('Error deleting old logo file:', deleteError)
            // Continue even if cleanup fails
          } else {
            console.log('Successfully cleaned up old logo file')
            setOldLogoPath(null) // Clear the old path since it's been deleted
          }
        } catch (cleanupError) {
          console.error('Unexpected error during old logo cleanup:', cleanupError)
          // Continue even if cleanup fails
        }
      }
    } else {
      // Handle logo removal - clear the logo_url
      console.log('Removing logo URL from database')
      const { error } = await supabase
        .from('startups')
        .update({ logo_url: null })
        .eq('id', startup.id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to remove logo URL:', error)
        setError('Failed to remove logo. Please try again.')
        return
      }

      console.log('Logo URL successfully removed from database')

      // Clean up old logo file when logo is removed
      if (oldLogoPath) {
        try {
          console.log('Cleaning up old logo file after removal:', oldLogoPath)
          const { error: deleteError } = await supabase.storage
            .from('startup-logos')
            .remove([oldLogoPath])

          if (deleteError) {
            console.error('Error deleting old logo file:', deleteError)
            // Continue even if cleanup fails
          } else {
            console.log('Successfully cleaned up old logo file')
            setOldLogoPath(null)
          }
        } catch (cleanupError) {
          console.error('Unexpected error during old logo cleanup:', cleanupError)
          // Continue even if cleanup fails
        }
      }
    }

    // Clear any previous errors and update local state
    setError('')
    setLogoUrl(url || null)
    setLogoPath(path || null)
    
    // Mark that we have successfully uploaded and saved a logo
    if (url && path) {
      setIsLogoUploaded(true)
      console.log('Logo upload completed successfully')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Startup Name *
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter startup name"
          required
          className="w-full"
        />
      </div>

      {/* Summary Field */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          Summary *
        </label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          placeholder="Brief overview of your startup (1-2 sentences)"
          rows={2}
          className="w-full"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          A concise summary that appears in listings and previews
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Detailed description of your startup, mission, and vision... (Supports markdown)"
          rows={6}
          className="w-full font-mono text-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Provide a comprehensive overview of your startup. Supports markdown formatting.
        </p>
      </div>

      {/* Tags Field */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <Input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="tech, saas, fintech (comma-separated)"
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Add relevant tags to help others discover your startup
        </p>
      </div>

      {/* Visibility Field */}
      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
          Visibility
        </label>
        <Select
          value={formData.visibility}
          onValueChange={(value) => handleInputChange('visibility', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="invite-only">Invite Only</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          Control who can see your startup
        </p>
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <StatusSelect
          value={formData.status}
          onValueChange={(value) => handleInputChange('status', value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Current funding stage or development status
        </p>
      </div>

      {/* Asks and Opportunities Field */}
      <div>
        <label htmlFor="asks_and_opportunities" className="block text-sm font-medium text-gray-700 mb-2">
          Asks & Opportunities
        </label>
        <Textarea
          id="asks_and_opportunities"
          value={formData.asks_and_opportunities}
          onChange={(e) => handleInputChange('asks_and_opportunities', e.target.value)}
          placeholder="What are you looking for? (investors, advisors, partnerships, etc.)"
          rows={3}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Describe what you're seeking from the network
        </p>
      </div>

      {/* Logo Upload Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Startup Logo
        </label>
        <UploadLogo 
          startupId={startup.id} 
          onUpload={handleUpload}
          currentLogoUrl={startup.logo_url}
        />
      </div>

      {/* Website URL Field */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
          Website URL
        </label>
        <Input
          id="website_url"
          type="url"
          value={formData.website_url}
          onChange={(e) => handleInputChange('website_url', e.target.value)}
          placeholder="https://yourstartup.com"
          className="w-full"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Startup'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}