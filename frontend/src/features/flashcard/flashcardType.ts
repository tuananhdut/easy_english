export interface IFlashcard {
  id: number
  collection_id: number
  term: string
  definition: string
  image_url?: string
  audio_url?: string
  pronunciation?: string
  is_private: boolean
  source_language: string
  target_language: string
  created_at: string
  updated_at: string
}

export interface ICreateFlashcardRequest {
  collection_id: number
  term: string
  definition: string
  image?: File
  audio?: File
}
//test

export interface ICreateFlashcardResponse {
  success: boolean
  data: IFlashcard
  message: string
}

export interface IUpdateFlashcardRequest {
  term?: string
  definition?: string
  image_url?: string
  audio_url?: string
  pronunciation?: string
}

export interface IUpdateFlashcardResponse {
  success: boolean
  data: IFlashcard
  message: string
}
