'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, CheckCircle, RefreshCw } from 'lucide-react'

interface UploadLogoProps {
    startupId: string
    onUpload: ((url: string) => void) | ((url: string, path?: string) => void)
    currentLogoUrl?: string | null
}

export default function UploadLogo({ startupId, onUpload, currentLogoUrl }: UploadLogoProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentLogoUrl || null)
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reset error state
        setError(null)

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a JPEG, PNG, WebP, or SVG image.')
            return
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('File is too large. Max size is 2MB.')
            return
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Create unique filename to avoid collisions
        const timestamp = Date.now()
        const fileExtension = file.name.split('.').pop()
        const fileName = `logo_${timestamp}.${fileExtension}`
        const filePath = `${startupId}/${fileName}`

        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            console.log("User in UploadLogo:", user)

            console.log('Attempting upload to:', filePath)
            console.log('File details:', { name: file.name, size: file.size, type: file.type })

            // First, check if the bucket exists and we have access
            const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
            console.log('Available buckets:', buckets?.map(b => b.name))

            if (bucketError) {
                console.error('Bucket list error:', bucketError)
                setError('Storage access error. Please check your configuration.')
                setUploading(false)
                return
            }

            const { error: uploadError } = await supabase.storage
                .from('startup-logos')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error('Upload error details:', {
                    message: uploadError.message,
                    name: uploadError.name,
                    stack: uploadError.stack
                })
                setError(`Upload failed: ${uploadError.message || 'Unknown error'}`)
                setUploading(false)
                return
            }

            const { data } = supabase.storage
                .from('startup-logos')
                .getPublicUrl(filePath)

            if (data?.publicUrl) {
                setUploadedUrl(data.publicUrl)
                setCurrentFilePath(filePath)
                if (onUpload.length === 2) {
                    (onUpload as (url: string, path?: string) => void)(data.publicUrl, filePath)
                } else {
                    (onUpload as (url: string) => void)(data.publicUrl)
                }
            } else {
                setError('Failed to get public URL. Please try again.')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveLogo = async () => {
        // If we have a current file path, delete it from storage
        if (currentFilePath) {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            try {
                const { error: deleteError } = await supabase.storage
                    .from('startup-logos')
                    .remove([currentFilePath])

                if (deleteError) {
                    console.error('Error deleting file:', deleteError)
                    // Continue with removal even if delete fails
                }
            } catch (err) {
                console.error('Unexpected error deleting file:', err)
                // Continue with removal even if delete fails
            }
        }

        // Reset state
        setUploadedUrl(null)
        setCurrentFilePath(null)
        
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }

        // Notify parent component
        if (onUpload.length === 2) {
            (onUpload as (url: string, path?: string) => void)('', '')
        } else {
            (onUpload as (url: string) => void)('')
        }
    }

    const handleReselect = () => {
        // Trigger file input click
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
            fileInput.click()
        }
    }

    return (
        <div className="space-y-4">
            {/* Current logo preview */}
            {uploadedUrl && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                        src={uploadedUrl}
                        alt="Startup logo"
                        width={48}
                        height={48}
                        className="object-cover rounded"
                        unoptimized
                    />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                        <p className="text-xs text-gray-500">Click buttons to change or remove</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReselect}
                            disabled={uploading}
                            className="text-blue-600 hover:text-blue-700"
                            title="Select different image"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveLogo}
                            disabled={uploading}
                            className="text-red-600 hover:text-red-700"
                            title="Remove logo"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* File upload input - always present but hidden when image is uploaded */}
            <div className="space-y-2">
                <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className={uploadedUrl ? 'hidden' : ''}
                />
                {!uploadedUrl && (
                    <p className="text-xs text-gray-500">
                        Accepted formats: JPEG, PNG, WebP, SVG. Max size: 2MB
                    </p>
                )}
            </div>

            {/* Upload status */}
            {uploading && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <Upload className="h-4 w-4 animate-pulse" />
                    <span>Uploading logo...</span>
                </div>
            )}

            {/* Success message */}
            {uploadedUrl && !uploading && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Logo uploaded successfully</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
        </div>
    )
} 