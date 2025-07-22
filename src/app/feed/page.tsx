'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { StartupCard } from '@/components/StartupCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Filter, TrendingUp, Users, Heart, MessageCircle, Bookmark } from 'lucide-react'

interface ActivityItem {
  id: string
  user: { name: string; email: string }
  startup: { id: string; name?: string; description?: string; tags: string[]; avg_rating: number }
  type: 'rated' | 'commented' | 'saved' | 'interested'
  timestamp: string
  content?: string
}

export default function Feed() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      user: { name: 'Sarah Kim', email: 'sarah@example.com' },
      startup: {
        id: '4',
        name: 'FoodTech Labs',
        description: 'Lab-grown meat production technology',
        tags: ['FoodTech', 'Sustainability', 'B2B'],
        avg_rating: 4.0
      },
      type: 'rated',
      timestamp: '2 hours ago',
      content: 'Rated 4.2/5 - Impressive technology with strong market potential'
    },
    {
      id: '2',
      user: { name: 'Michael Rodriguez', email: 'michael@example.com' },
      startup: {
        id: '5',
        name: 'QuantumAI',
        description: 'Quantum computing solutions for financial modeling',
        tags: ['AI', 'Quantum', 'FinTech'],
        avg_rating: 4.5
      },
      type: 'commented',
      timestamp: '4 hours ago',
      content: 'The team has deep expertise in quantum algorithms. Watching this space closely.'
    },
    {
      id: '3',
      user: { name: 'Emily Chen', email: 'emily@example.com' },
      startup: {
        id: '6',
        name: 'GreenLogistics',
        description: 'Carbon-neutral delivery network for e-commerce',
        tags: ['Logistics', 'Sustainability', 'E-commerce'],
        avg_rating: 3.8
      },
      type: 'saved',
      timestamp: '6 hours ago'
    }
  ]

  const trendingStartups = [
    {
      id: '7',
      user_id: '3',
      name: 'NeuroLink Pro',
      description: 'Brain-computer interface for medical applications',
      tags: ['MedTech', 'AI', 'Hardware'],
      logo_url: '',
      website_url: '',
      visibility: 'public' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      avg_rating: 4.7,
      user_ratings: [],
      users: { name: 'Dr. James Wilson', email: 'james@example.com' }
    },
    {
      id: '8',
      user_id: '4',
      name: 'SpaceVenture',
      description: 'Satellite manufacturing for small businesses',
      tags: ['Space', 'Manufacturing', 'B2B'],
      logo_url: '',
      website_url: '',
      visibility: 'public' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      avg_rating: 4.3,
      user_ratings: [],
      users: { name: 'Lisa Park', email: 'lisa@example.com' }
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rated':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'commented':
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case 'saved':
        return <Bookmark className="h-4 w-4 text-purple-600" />
      case 'interested':
        return <Heart className="h-4 w-4 text-red-600" />
      default:
        return <Users className="h-4 w-4 text-slate-600" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'rated':
        return 'rated'
      case 'commented':
        return 'commented on'
      case 'saved':
        return 'saved'
      case 'interested':
        return 'expressed interest in'
      default:
        return 'interacted with'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Network Feed</h1>
              <p className="text-slate-600 mt-1">
                Discover startups through your trusted network
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search network activity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'rated', 'commented', 'saved', 'interested'].map(filter => (
                <Badge
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              {/* Activity Feed */}
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {activity.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <span className="text-sm text-slate-600">
                            <span className="font-medium text-slate-900">{activity.user.name}</span>
                            {' '}{getActivityText(activity)}{' '}
                            <span className="font-medium text-slate-900">{activity.startup.name || 'Unnamed Startup'}</span>
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">{activity.timestamp}</span>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 mb-1">{activity.startup.name || 'Unnamed Startup'}</h3>
                              <p className="text-sm text-slate-600 mb-2">{activity.startup.description || 'No description available'}</p>
                              <div className="flex flex-wrap gap-1">
                                {activity.startup.tags.map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-900">
                                ⭐ {activity.startup.avg_rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                          
                          {activity.content && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-sm text-slate-700 italic">"{activity.content}"</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <button className="flex items-center space-x-1 hover:text-slate-700">
                            <Heart className="h-4 w-4" />
                            <span>Like</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-slate-700">
                            <MessageCircle className="h-4 w-4" />
                            <span>Comment</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-slate-700">
                            <Bookmark className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingStartups.map(startup => (
                  <StartupCard 
                    key={startup.id} 
                    startup={startup}
                    showOwner={true}
                    onUpdate={() => {}}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 