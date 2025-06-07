export interface IStartStudySessionRequest {
  collectionId: string
}

export interface IStudyFlashcard {
  id: number
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
  intro: boolean
  quiz: boolean
  typing: boolean
  score: number
}
//test

export interface IStudySession {
  id: number
  userId: number
  collectionId: number
  flashcards: IStudyFlashcard[]
  currentIndex: number
  status: 'introduction' | 'quiz' | 'typing' | 'completed'
  startTime: string
  score: number
  endTime: string | null
}

export interface ICheckAnswerResponse {
  isCorrect: boolean
  correctAnswer: string
  nextPhase: IStudySession
}
