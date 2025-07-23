// Network connection types for the networking feature

export interface NetworkConnection {
  id: number
  name: string
  role: string
  company: string
  location: string
  avatar: string
  mutualConnections: number
  lastActive: string
  tags: string[]
}

export interface SuggestedConnection {
  id: number
  name: string
  role: string
  company: string
  location: string
  avatar: string
  mutualConnections: number
  tags: string[]
} 