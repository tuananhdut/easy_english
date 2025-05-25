export interface IFlashcard {
  id: number
  collection_id: number
  front_text: string
  back_text: string
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
  front_text: string
  back_text: string
  image_url?: string
  audio_url?: string
}

export interface ICreateFlashcardResponse {
  success: boolean
  data: IFlashcard
  message: string
}

export interface IUpdateFlashcardRequest {
  front_text?: string
  back_text?: string
  image_url?: string
  audio_url?: string
  pronunciation?: string
}

export interface IUpdateFlashcardResponse {
  success: boolean
  data: IFlashcard
  message: string
}

export interface IDeleteFlashcardResponse {
  success: boolean
  message: string
}
