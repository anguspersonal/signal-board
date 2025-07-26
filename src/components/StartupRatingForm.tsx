'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { RATING_DIMENSIONS, RatingDimension } from '@/types/startup'
import { createBrowserClient } from '@supabase/ssr'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface StartupRatingFormProps {
  startupId: string
  userId: string
  onRatingSubmitted?: () => void
}

export function StartupRatingForm({ startupId, userId, onRatingSubmitted }: StartupRatingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [ratings, setRatings] = useState<{
    [key in RatingDimension]: { score: number; comment: string }
  }>({
    'market-demand': { score: 0, comment: '' },
    'solution-execution': { score: 0, comment: '' },
    'team-founders': { score: 0, comment: '' },
    'business-model': { score: 0, comment: '' },
    'validation-traction': { score: 0, comment: '' },
    'environment-runway': { score: 0, comment: '' }
  })
  const [visibility, setVisibility] = useState<'public' | 'private' | 'inner-circle'>('public')

  const handleScoreChange = (dimension: RatingDimension, score: number) => {
    setRatings(prev => ({
      ...prev,
      [dimension]: { ...prev[dimension], score }
    }))
  }

  const handleCommentChange = (dimension: RatingDimension, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [dimension]: { ...prev[dimension], comment }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate that all dimensions have scores
    const hasAllScores = Object.values(ratings).every(rating => rating.score > 0)
    if (!hasAllScores) {
      setError('Please provide a score for all dimensions')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // First, delete any existing ratings for this user and startup
      await supabase
        .from('startup_ratings')
        .delete()
        .eq('startup_id', startupId)
        .eq('user_id', userId)

      // Insert new ratings for each dimension
      const ratingPromises = Object.entries(ratings).map(([dimension, rating]) =>
        supabase
          .from('startup_ratings')
          .insert({
            startup_id: startupId,
            user_id: userId,
            dimension,
            score: rating.score,
            comment: rating.comment.trim() || null,
            visibility,
          })
      )

      await Promise.all(ratingPromises)

      // Reset form
      setRatings({
        'market-demand': { score: 0, comment: '' },
        'solution-execution': { score: 0, comment: '' },
        'team-founders': { score: 0, comment: '' },
        'business-model': { score: 0, comment: '' },
        'validation-traction': { score: 0, comment: '' },
        'environment-runway': { score: 0, comment: '' }
      })

      onRatingSubmitted?.()

    } catch (err) {
      console.error('Error submitting ratings:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (dimension: RatingDimension) => {
    const currentScore = ratings[dimension].score
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => handleScoreChange(dimension, score)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                score <= currentScore
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-600">
          {currentScore > 0 ? `${currentScore}/5` : 'Not rated'}
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate this Startup</CardTitle>
        <p className="text-sm text-slate-600">
          Rate this startup across all six dimensions using the Hally Framework
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visibility Selector */}
          <div>
            <Label htmlFor="visibility" className="font-medium text-slate-900">
              Rating Visibility
            </Label>
            <RadioGroup
              id="visibility"
              value={visibility}
              onValueChange={val => setVisibility(val as 'public' | 'private' | 'inner-circle')}
              className="flex flex-col gap-2 mt-2"
            >
              <RadioGroupItem value="public" id="public">
                <Label htmlFor="public" className="ml-2 cursor-pointer">
                  Public
                  <span className="ml-1 text-xs text-slate-500" title="Visible to everyone.">
                    (Visible to everyone)
                  </span>
                </Label>
              </RadioGroupItem>
              <RadioGroupItem value="private" id="private">
                <Label htmlFor="private" className="ml-2 cursor-pointer">
                  Private
                  <span className="ml-1 text-xs text-slate-500" title="Only you can see this rating.">
                    (Only you can see this rating)
                  </span>
                </Label>
              </RadioGroupItem>
              <RadioGroupItem value="inner-circle" id="inner-circle">
                <Label htmlFor="inner-circle" className="ml-2 cursor-pointer">
                  Inner Circle
                  <span className="ml-1 text-xs text-slate-500" title="Visible to users with special access to this startup.">
                    (Visible to users with special access)
                  </span>
                </Label>
              </RadioGroupItem>
            </RadioGroup>
          </div>
          {/* End Visibility Selector */}
          {/* Ratings Inputs */}
          {Object.entries(RATING_DIMENSIONS).map(([key, label]) => (
            <div key={key} className="space-y-3">
              <div>
                <h4 className="font-medium text-slate-900">{label}</h4>
                <p className="text-sm text-slate-600 mb-2">
                  {getDimensionDescription(key as RatingDimension)}
                </p>
                {renderStars(key as RatingDimension)}
              </div>
              <Textarea
                placeholder={`Add your thoughts on ${label.toLowerCase()}...`}
                value={ratings[key as RatingDimension].comment}
                onChange={(e) => handleCommentChange(key as RatingDimension, e.target.value)}
                rows={2}
                className="w-full"
              />
            </div>
          ))}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Ratings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getDimensionDescription(dimension: RatingDimension): string {
  const descriptions = {
    'market-demand': 'How strong is the market demand and opportunity size?',
    'solution-execution': 'How well does the solution address the problem and how is it executed?',
    'team-founders': 'How capable and experienced is the founding team?',
    'business-model': 'How viable and scalable is the business model?',
    'validation-traction': 'What evidence exists of product-market fit and growth?',
    'environment-runway': 'How favorable are the external conditions and funding runway?'
  }
  return descriptions[dimension]
} 