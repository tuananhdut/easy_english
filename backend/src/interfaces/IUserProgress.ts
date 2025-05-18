import { User } from '../entities/User'
import { Flashcard } from '../entities/FlashCard'

export interface IUserProgress {
  id: number
  user: User
  flashcard: Flashcard
  study_count: number
  ease_factor: number
  next_review?: Date
  created_at: Date
  updated_at: Date
}

export interface IUserProgressRequest {
  user_id: number
  flashcard_id: number
  study_count: number
  last_reviewed?: Date
  ease_factor: number
  next_review?: Date
}
