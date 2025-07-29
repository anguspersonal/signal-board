'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UploadLogo from '@/components/ui/UploadLogo'
import { StatusSelect } from '@/components/ui/StatusSelect'

export function StartupForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoPath, setLogoPath] = useState<string | null>(null)
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

  // Cleanup function to delete uploaded files if form is abandoned
  const cleanupUploadedFiles = useCallback(async () => {
    if (logoPath) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      try {
        await supabase.storage
          .from('startup-logos')
          .remove([logoPath])
      } catch (err) {
        console.error('Error cleaning up uploaded files:', err)
      }
    }
  }, [logoPath])

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
    router.push('/dashboard')
  }

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

      // Create startup WITHOUT logo_url initially to avoid saving temporary URLs
      const { data, error: insertError } = await supabase
        .from('startups')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          summary: formData.summary.trim() || null,
          description: formData.description.trim() || null,
          tags: tags.length > 0 ? tags : null,
          logo_url: null, // Don't save temporary URL
          website_url: formData.website_url.trim() || null,
          visibility: formData.visibility,
          status: formData.status.trim() || null,
          asks_and_opportunities: formData.asks_and_opportunities.trim() || null
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting startup:', insertError)
        setError(insertError.message || 'Failed to create startup')
        return
      }

      // If logoPath exists, move file to final location and update logo_url
      if (logoPath && data?.id) {
        try {
          const fileName = logoPath.split('/').pop()
          const fileExtension = fileName?.split('.').pop()
          const finalPath = `${data.id}/logo_${Date.now()}.${fileExtension}`

          console.log('Moving logo from temp path to final path:', { from: logoPath, to: finalPath })

          const { error: moveError } = await supabase.storage
            .from('startup-logos')
            .move(logoPath, finalPath)

          if (moveError) {
            console.error('Error moving logo file:', moveError)
            // Continue with startup creation even if logo move fails
          } else {
            // Get new public URL after moving the file
            const { data: publicData } = supabase.storage
              .from('startup-logos')
              .getPublicUrl(finalPath)

            if (publicData?.publicUrl) {
              console.log('Updating startup with final logo URL:', publicData.publicUrl)
              
              // Update the startup with the new logo URL using the final path
              const { error: updateError } = await supabase
                .from('startups')
                .update({ logo_url: publicData.publicUrl })
                .eq('id', data.id)

              if (updateError) {
                console.error('Error updating logo URL after file move:', updateError)
                // Continue with redirect even if logo URL update fails
              } else {
                console.log('Successfully updated startup with final logo URL')
              }
            } else {
              console.error('Failed to get public URL for moved logo file')
            }
          }
        } catch (logoError) {
          console.error('Unexpected error during logo processing:', logoError)
          // Continue with startup creation even if logo processing fails
        }
      }

      // Redirect to the new startup's page or dashboard
      if (data?.id) {
        router.push(`/startups/${data.id}`)
      } else {
        router.push('/dashboard')
      }

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
    // For new startups, we'll store the URL and path in state only
    // The URL will be used for UI preview, but won't be saved to DB until after file move
    setLogoPath(path || null)
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
          placeholder="Select status"
        />
        <p className="text-sm text-gray-500 mt-1">
          Current development or investment status
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
          startupId={`new_${userId}_${Date.now()}`} 
          onUpload={handleUpload}
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
          {isLoading ? (
            <span className="hidden sm:inline">Creating...</span>
          ) : (
            <>
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create Startup</span>
            </>
          )}
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