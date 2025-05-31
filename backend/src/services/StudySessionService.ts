import { StudySessionRepository } from '../repositories/StudySessionRepository'
import { CollectionRepository } from '../repositories/CollectionRepository'
import { FlashCardRepository } from '../repositories/FlashCardRepository'
import { User } from '../entities/User'
import { ApiError } from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { IStudySession, IFlashcardStudy } from '../interfaces/IStudySession'
import { Phase, StudySession } from '../entities/StudySession'
import { Flashcard } from '../entities/FlashCard'
import { UserProgressRepository } from '~/repositories/UserProgressRepository'

export class StudySessionService {
  private studySessionRepository: StudySessionRepository
  private collectionRepository: CollectionRepository
  private flashCardRepository: FlashCardRepository
  private userProgressRepository: UserProgressRepository

  constructor() {
    this.studySessionRepository = new StudySessionRepository()
    this.collectionRepository = new CollectionRepository()
    this.flashCardRepository = new FlashCardRepository()
    this.userProgressRepository = new UserProgressRepository()
  }

  private transformToResponse(session: StudySession): IStudySession {
    return {
      id: session.id,
      userId: session.userId,
      collectionId: session.collectionId,
      flashcards: session.flashcards,
      currentIndex: session.currentIndex,
      status: session.status,
      score: session.score,
      startTime: session.startTime,
      endTime: session.endTime
    }
  }

  private nextPhaseFlashCard(card: IFlashcardStudy): IFlashcardStudy {
    if (!card.intro) {
      return { ...card, intro: true }
    } else if (!card.quiz) {
      return { ...card, quiz: true }
    } else if (!card.typing) {
      return { ...card, typing: true }
    }
    return card
  }

  private getCurrentPhase(card: IFlashcardStudy): Phase {
    if (!card.intro) return Phase.INTRO
    if (!card.quiz) return Phase.QUIZ
    if (!card.typing) return Phase.TYPING
    return Phase.COMPLETED
  }

  private getRandomIndex(currentIndex: number, totalCards: number): number {
    if (totalCards <= 1) return 0

    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * totalCards)
    } while (randomIndex === currentIndex)

    return randomIndex
  }

  async startSession(user: User, collectionId: number): Promise<IStudySession> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id: collectionId },
      relations: {
        owner: true,
        sharedCollections: {
          shared_with: true
        }
      },
      select: {
        id: true,
        name: true,
        is_private: true,
        total_flashcards: true,
        owner: {
          id: true
        }
      }
    })
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ thẻ')
    }

    const isOwner = collection.owner.id === user.id
    const hasAccess = collection.sharedCollections.some((shared) => shared.shared_with.id === user.id)

    if (!isOwner && !hasAccess) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập vào bộ thẻ này')
    }

    let activeSession = await this.studySessionRepository.findActiveSession(user, collection)
    if (activeSession && activeSession.flashcards.length != 0) {
      return this.transformToResponse(activeSession)
    }

    const flashcards = await this.flashCardRepository.findFirstFlashcards(collection, 4)
    if (flashcards.length < 4) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có đủ thẻ để học')
    }

    if (!activeSession) {
      activeSession = await this.studySessionRepository.createSession(user, collection)
    }
    const mappedFlashcards = flashcards.map(
      (card: Flashcard): IFlashcardStudy => ({
        id: card.id,
        collection: card.collection,
        front_text: card.front_text,
        back_text: card.back_text,
        image_url: card.image_url,
        audio_url: card.audio_url,
        pronunciation: card.pronunciation,
        is_private: card.is_private,
        source_language: card.source_language,
        target_language: card.target_language,
        created_at: card.created_at,
        updated_at: card.updated_at,
        intro: false,
        quiz: false,
        typing: false,
        score: 30
      })
    )
    activeSession.flashcards = mappedFlashcards
    activeSession.currentIndex = 0
    activeSession.status = Phase.INTRO
    await this.studySessionRepository.save(activeSession)

    return this.transformToResponse(activeSession)
  }

  async nextPhase(sessionId: number, user: User): Promise<IStudySession> {
    const session = await this.studySessionRepository.findOne(sessionId)
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên học')
    }

    if (session.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập')
    }

    // Cập nhật session
    const updatedSession = await this.studySessionRepository.updateSessionProgress(sessionId, {
      currentIndex: 0
    })

    // Reset trạng thái của flashcard hiện tại
    if (updatedSession.flashcards) {
      const currentCard = updatedSession.flashcards[updatedSession.currentIndex]
      if (currentCard) {
        updatedSession.flashcards[updatedSession.currentIndex] = {
          ...currentCard,
          intro: false,
          quiz: false,
          typing: false
        }
      }
      await this.studySessionRepository.save(updatedSession)
    }

    // Cập nhật status để phản ánh trạng thái của flashcard hiện tại
    const currentCard = updatedSession.flashcards[updatedSession.currentIndex]
    if (currentCard) {
      await this.studySessionRepository.updateSessionProgress(sessionId, {
        status: this.getCurrentPhase(currentCard)
      })
    }

    return this.transformToResponse(updatedSession)
  }

  async checkAnswer(
    sessionId: number,
    user: User,
    answer: string
  ): Promise<{
    isCorrect: boolean
    correctAnswer: string
    nextPhase?: IStudySession
  }> {
    const session = await this.studySessionRepository.findOne(sessionId)
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên học')
    }

    if (session.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập')
    }

    const currentCard = session.flashcards[session.currentIndex]
    const isCorrect = answer.toLowerCase() === currentCard.front_text.toLowerCase()

    // Cập nhật trạng thái
    let newCurrentIndex = session.currentIndex

    if (isCorrect) {
      if (currentCard) {
        session.flashcards[session.currentIndex] = this.nextPhaseFlashCard(currentCard)
        if (
          session.flashcards[session.currentIndex].intro === true &&
          session.flashcards[session.currentIndex].quiz === true &&
          session.flashcards[session.currentIndex].typing === true
        ) {
          const flashcard = await this.flashCardRepository.findOne(session.flashcards[session.currentIndex].id)
          if (flashcard) {
            await this.userProgressRepository.createUserProgress(
              {
                user_id: user.id,
                flashcard_id: session.flashcards[session.currentIndex].id,
                study_count: 1,
                ease_factor: 2.5
              },
              user,
              flashcard
            )
            session.score += session.flashcards[session.currentIndex].score
            console.log(' check kkkk ', session.score)
            session.flashcards = session.flashcards.filter(
              (card) => card.id !== session.flashcards[session.currentIndex].id
            )
          }
        }
      }
      if (session.flashcards.length > 0) {
        newCurrentIndex = this.getRandomIndex(session.currentIndex, session.flashcards.length)
        session.status = this.getCurrentPhase(session.flashcards[newCurrentIndex])
      } else {
        newCurrentIndex = -1
        session.status = Phase.COMPLETED
      }
    } else {
      if (currentCard) {
        if (session.flashcards[session.currentIndex].score > 0) {
          session.flashcards[session.currentIndex].score -= 5
        }
        const updatedCard = {
          ...currentCard,
          intro: false
        }
        session.flashcards[session.currentIndex] = updatedCard
        // Reset status về INTRO khi trả lời sai
        session.status = Phase.INTRO
      }
    }

    // Cập nhật session với trạng thái mới
    const updatedSession = await this.studySessionRepository.updateSessionProgress(sessionId, {
      currentIndex: newCurrentIndex,
      status: session.status,
      score: session.score
    })

    // Cập nhật flashcards trong session
    if (updatedSession.flashcards) {
      updatedSession.flashcards = session.flashcards
      await this.studySessionRepository.save(updatedSession)
    }

    return {
      isCorrect,
      correctAnswer: currentCard.front_text,
      nextPhase: updatedSession
    }
  }
}
