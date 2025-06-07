export interface CollectionType {
  name: string
  description: string
  is_private: boolean
  source_language: string
  target_language: string
  level: CollectionLevel
}

export enum CollectionLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface ICollection {
  id: number
  name: string
  description: string
  is_private: boolean
  source_language: string
  target_language: string
  total_flashcards: number
  level: string
  category?: string | 'Từ vựng'
  created_at: string
  updated_at: string
  owner: {
    id: number
    fullName: string
    email: string
    image: string
  }
  learnedWords: number
  reviewWords: number
  sharedUsersCount: number
}

export interface ICollectionsResponse {
  collections: ICollection[]
  total: number
}

export interface ICreateCollectionRequest {
  name: string
  description?: string
  is_private: boolean
  level: string
  source_language?: string
  target_language?: string
}

export interface ISharedUser {
  id: number
  fullName: string | null
  email: string | null
  image: string | null
  permission: string
}

export interface ISharedUsersResponse {
  users: ISharedUser[]
}
