import { Phase } from '~/entities/StudySession'
import { IFlashCard } from './IFlashCard'

export interface IStudySession {
  userId: number
  collectionId: number
  flashcards: IFlashcardStudy[]
  currentIndex: number
  status: Phase
  score: number
  startTime: Date
  endTime?: Date
  created_at: Date
  updated_at: Date
}

export interface IFlashcardStudy extends IFlashCard {
  intro: boolean
  quiz: boolean
  typing: boolean
  score: number
}
