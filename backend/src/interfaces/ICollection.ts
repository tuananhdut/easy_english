import { User } from '../entities/User'
import { CollectionLevel } from '../entities/Collection'

export interface ICollection {
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
}

export interface ICollectionRequest {
  name: string
  description?: string
  is_private: boolean
  source_language: string
  target_language: string
  level: CollectionLevel
}
