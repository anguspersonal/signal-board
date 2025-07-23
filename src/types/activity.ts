// Activity feed types for social features

export interface ActivityItem {
  id: string
  user: { name: string; email: string }
  startup: { id: string; name?: string; description?: string; tags: string[]; avg_rating: number }
  type: 'rated' | 'commented' | 'saved' | 'interested'
  timestamp: string
  content?: string
} 