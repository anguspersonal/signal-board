'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface StartupFormProps {
  userId: string
}

export function StartupForm({ userId }: StartupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    logo_url: '',
    website_url: ''
  })

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

      const { data, error: insertError } = await supabase
        .from('startups')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          tags: tags.length > 0 ? tags : null,
          logo_url: formData.logo_url.trim() || null,
          website_url: formData.website_url.trim() || null,
          visibility: 'public'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting startup:', insertError)
        setError(insertError.message || 'Failed to create startup')
        return
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

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your startup..."
          rows={4}
          className="w-full"
        />
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

      {/* Logo URL Field */}
      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
          Logo URL
        </label>
        <Input
          id="logo_url"
          type="url"
          value={formData.logo_url}
          onChange={(e) => handleInputChange('logo_url', e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full"
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
          {isLoading ? 'Creating...' : 'Create Startup'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 