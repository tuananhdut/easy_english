export interface IStartStudySessionRequest {
  collectionId: string
}

export interface IStudyFlashcard {
  id: number
  front_text: string
  back_text: string
  image_url: string | null
  audio_url: string | null
  pronunciation: string | null
  is_private: boolean
  source_language: string
  target_language: string
  created_at: string
  updated_at: string
  intro: boolean
  quiz: boolean
  typing: boolean
}
//test

export interface IStudySession {
  id: number
  userId: number
  collectionId: number
  flashcards: IStudyFlashcard[]
  currentIndex: number
  status: 'introduction' | 'learning' | 'review' | 'completed'
  startTime: string
  endTime: string | null
}

export interface IStartStudySessionResponse {
  id: number
  userId: number
  collectionId: number
  flashcards: IStudyFlashcard[]
  currentIndex: number
  status: 'introduction' | 'learning' | 'review' | 'completed'
  startTime: string
  endTime: string | null
}

export interface IUser {
  id: number
  email: string | null
  username: string
  image: string | null
  provider: string
  role: string
  fullName: string
  googleId: string | null
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export interface INextPhase {
  id: number
  flashcards: IStudyFlashcard[]
  currentIndex: number
  status: 'introduction' | 'learning' | 'review' | 'completed'
  startTime: string
  endTime: string | null
  created_at: string
  updated_at: string
}

export interface ICheckAnswerResponse {
  isCorrect: boolean
  correctAnswer: string
  nextPhase: INextPhase
}
