import { IUser } from '../user/userType'

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

// fix cái này
export interface Collection {
  id: number
  name: string
  description: string
  is_private: boolean
  source_language: string
  target_language: string
  level: CollectionLevel
  total_flashcards: number
  owner: IUser
}
