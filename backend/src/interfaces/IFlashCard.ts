import { Collection } from '../entities/Collection'

export interface IFlashCard {
  id: number
  collection: Collection
  front_text: string
  back_text: string
  image_url?: string
  audio_url?: string
  created_at: Date
  updated_at: Date
}

export interface IFlashCardRequest {
  collection_id: number
  front_text: string
  back_text: string
  image_url?: string
  audio_url?: string
}
