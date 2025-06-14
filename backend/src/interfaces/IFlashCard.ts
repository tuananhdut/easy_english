import { Collection } from '../entities/Collection'

export interface IFlashCard {
  id: number
  collection: Collection
  term: string
  definition: string
  image_url?: string
  audio_url?: string
  created_at: Date
  updated_at: Date
  pronunciation?: string
  is_private?: boolean
  source_language: string
  target_language: string
}

export interface IFlashCardRequest {
  collection_id: number
  term: string
  definition: string
  pronunciation?: string
  image_url?: string
  audio_url?: string
  is_private?: boolean
  source_language?: string
  target_language?: string
}

export interface IFlashCardResponse {
  id: number
  term: string
  definition: string
  image_url?: string
  audio_url?: string
  pronunciation?: string
  is_private?: boolean
  source_language: string
  target_language: string
  created_at: Date
  updated_at: Date
  collection: {
    id: number
    name: string
  }
}
