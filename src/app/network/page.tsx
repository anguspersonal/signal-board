'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  Users, 
  UserPlus, 
  MessageCircle, 
  Building2,
  MapPin,
  Globe,
  Calendar
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'

export default function Network() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock network data
  const networkConnections = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 12,
      lastActive: '2 days ago',
      tags: ['Product', 'SaaS', 'B2B']
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Founder & CEO',
      company: 'StartupXYZ',
      location: 'New York, NY',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 8,
      lastActive: '1 week ago',
      tags: ['AI', 'Machine Learning', 'Healthcare']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Investor',
      company: 'Venture Capital Partners',
      location: 'Austin, TX',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 15,
      lastActive: '3 days ago',
      tags: ['Fintech', 'Investment', 'Early Stage']
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'CTO',
      company: 'Innovation Labs',
      location: 'Seattle, WA',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 6,
      lastActive: '5 days ago',
      tags: ['Engineering', 'Cloud', 'DevOps']
    }
  ]

  const suggestedConnections = [
    {
      id: 5,
      name: 'Lisa Wang',
      role: 'Marketing Director',
      company: 'GrowthCo',
      location: 'Los Angeles, CA',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 3,
      tags: ['Marketing', 'Growth', 'B2C']
    },
    {
      id: 6,
      name: 'Alex Thompson',
      role: 'Data Scientist',
      company: 'DataFlow',
      location: 'Boston, MA',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 7,
      tags: ['Data Science', 'Analytics', 'ML']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Network</h1>
              <p className="text-muted-foreground mt-1">
                Connect with founders, investors, and industry professionals
              </p>
            </div>
            <Button 
              onClick={() => router.push('/network/invite')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Connections
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search connections..."
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
              {['all', 'founders', 'investors', 'professionals', 'recent'].map(filter => (
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

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  +12 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Founders</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +5 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investors</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  connections this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Connections */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">Your Connections</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {networkConnections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-foreground">{connection.name}</h3>
                              <p className="text-sm text-muted-foreground">{connection.role} at {connection.company}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                <Users className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {connection.location}
                            </div>
                            <div>{connection.mutualConnections} mutual connections</div>
                            <div>Active {connection.lastActive}</div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {connection.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suggested Connections */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Suggested Connections</h2>
              
              <div className="space-y-4">
                {suggestedConnections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground">{connection.name}</h3>
                          <p className="text-xs text-muted-foreground">{connection.role} at {connection.company}</p>
                          <p className="text-xs text-muted-foreground">{connection.mutualConnections} mutual connections</p>
                          
                          <div className="mt-2 flex flex-wrap gap-1">
                            {connection.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-3 flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="outline" className="w-full">
                View More Suggestions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 