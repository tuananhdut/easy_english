import { User } from '../entities/User'
import { CollectionLevel } from '../entities/Collection'
import { Collection } from '../entities/Collection'
import { SharePermission } from '../entities/SharedCollection'

export interface ICollection extends Collection {
  id: number
  name: string
  description?: string
  is_private: boolean
  created_at: Date
  updated_at: Date
  source_language: string
  target_language: string
  total_flashcards: number
  owner: User
  level: CollectionLevel
  learnedWords?: number
  reviewWords?: number
}

export interface ICollectionRequest {
  name: string
  description?: string
  is_private?: boolean
  source_language?: string
  target_language?: string
  level?: CollectionLevel
}

export interface ICollectionResponse {
  id: number
  name: string
  description?: string
  is_private: boolean
  created_at: Date
  updated_at: Date
  source_language: string
  target_language: string
  total_flashcards: number
  owner: {
    id: number
    fullName: string
    email: string
    image: string
  }
  level: CollectionLevel
  learnedWords: number
  reviewWords: number
  sharedUsersCount: number
  permission?: SharePermission
}
