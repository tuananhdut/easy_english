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

// Định nghĩa kiểu trả về cho SM-2
interface ReviewResult {
  next_review: Date
  ease_factor: number
}

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

  private async mapingFlashcardToFlashcadStudy(flashcards: IFlashcardStudy[]): Promise<IFlashcardStudy[]> {
    const mappedFlashcards = await Promise.all(
      flashcards.map(async (flashcard) => {
        const dbFlashcard = await this.flashCardRepository.findOne(flashcard.id)
        if (!dbFlashcard) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thẻ flashcard')
        }
        return {
          id: dbFlashcard.id,
          collection: dbFlashcard.collection,
          term: dbFlashcard.term,
          definition: dbFlashcard.definition,
          image_url: dbFlashcard.image_url,
          audio_url: dbFlashcard.audio_url,
          pronunciation: dbFlashcard.pronunciation,
          is_private: dbFlashcard.is_private,
          source_language: dbFlashcard.source_language,
          target_language: dbFlashcard.target_language,
          created_at: dbFlashcard.created_at,
          updated_at: dbFlashcard.updated_at,
          intro: flashcard.intro,
          quiz: flashcard.quiz,
          typing: flashcard.typing,
          score: flashcard.score
        }
      })
    )
    return mappedFlashcards
  }

  private async transformToResponse(session: StudySession): Promise<IStudySession> {
    const mappedFlashcards = await this.mapingFlashcardToFlashcadStudy(session.flashcards)
    return {
      userId: session.userId,
      collectionId: session.collectionId,
      flashcards: mappedFlashcards,
      currentIndex: session.currentIndex,
      status: session.status,
      score: session.score,
      startTime: session.startTime,
      endTime: session.endTime,
      created_at: session.created_at,
      updated_at: session.updated_at
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
    if (activeSession && activeSession.flashcards.length > 0) {
      return this.transformToResponse(activeSession)
    }

    const flashcards = await this.flashCardRepository.findFirstFlashcards(collection, 4, user.id)
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
        term: card.term,
        definition: card.definition,
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

    // Lấy lại session từ database để đảm bảo đồng bộ
    const dbSession = await this.studySessionRepository.findOneSesstion(user.id, collection.id)
    return this.transformToResponse(dbSession!)
  }

  async nextPhase(userId: number, collectionId: number, user: User): Promise<IStudySession> {
    const session = await this.studySessionRepository.findOneSesstion(userId, collectionId)
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên học')
    }

    if (session.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập')
    }

    // Cập nhật session
    const updatedSession = await this.studySessionRepository.updateSessionProgress(userId, collectionId, {
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
      await this.studySessionRepository.updateSessionProgress(userId, collectionId, {
        status: this.getCurrentPhase(currentCard)
      })
    }

    return this.transformToResponse(updatedSession)
  }

  async checkAnswer(
    userId: number,
    collectionId: number,
    user: User,
    answer: string
  ): Promise<{
    isCorrect: boolean
    correctAnswer: string
    nextPhase?: IStudySession
  }> {
    const session = await this.studySessionRepository.findOneSesstion(userId, collectionId)
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên học')
    }

    if (session.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập')
    }

    const currentCard = session.flashcards[session.currentIndex]
    if (!currentCard || !currentCard.term) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy thẻ flashcard hiện tại')
    }

    if (!answer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập câu trả lời')
    }

    const isCorrect = answer.toLowerCase().trim() === currentCard.term.toLowerCase().trim()

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
                study_count: 0,
                ease_factor: 2
              },
              user,
              flashcard
            )
            session.score = session.score + session.flashcards[session.currentIndex].score
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
        session.flashcards = []
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
        session.status = Phase.INTRO
      }
    }

    // Cập nhật session với trạng thái mới
    let updatedSession = await this.studySessionRepository.updateSessionProgress(userId, collectionId, {
      currentIndex: newCurrentIndex,
      status: session.status,
      score: session.score
    })

    // Cập nhật flashcards trong session
    if (updatedSession.flashcards) {
      updatedSession.flashcards = session.flashcards
    }
    updatedSession = await this.studySessionRepository.save(updatedSession)
    return {
      isCorrect,
      correctAnswer: currentCard.term,
      nextPhase: updatedSession
    }
  }

  async getPaginatedScores(
    collectionId: number,
    page: number,
    limit: number,
    currentUser: User
  ): Promise<{
    scores: Array<{ userId: number; fullname: string; score: number; rank: number }>
    total: number
    currentUserRank?: number
  }> {
    const { sessions, total } = await this.studySessionRepository.findScoresByCollection(collectionId, page, limit)

    const scores = sessions.map((session, index) => ({
      userId: session.userId,
      fullname: session.user.fullName || '',
      score: session.score,
      rank: (page - 1) * limit + index + 1
    }))

    // Kiểm tra xem người dùng hiện tại có trong danh sách không
    const currentUserInList = scores.some((score) => score.userId === currentUser.id)

    // Nếu người dùng không có trong danh sách, lấy rank của họ
    let currentUserRank
    if (!currentUserInList) {
      currentUserRank = await this.studySessionRepository.findUserRank(collectionId, currentUser.id)

      // Nếu người dùng có điểm, thêm vào cuối danh sách
      const currentUserSession = await this.studySessionRepository.findOneSesstion(currentUser.id, collectionId)
      if (currentUserSession) {
        scores.push({
          userId: currentUser.id,
          fullname: currentUser.fullName || '',
          score: currentUserSession.score,
          rank: currentUserRank
        })
      }
    }

    return { scores, total, currentUserRank }
  }

  async startReviewSession(user: User, collectionId: number): Promise<IStudySession> {
    // Lấy collection
    const collection = await this.collectionRepository.findOne(collectionId)
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bộ thẻ')
    }

    // Lấy tối đa 4 progress cần ôn tập của user với collection này
    const reviewProgress = await this.userProgressRepository.findDueProgressByUserAndCollection(user, collectionId, 4)
    if (reviewProgress.length < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có flashcard nào cần ôn tập')
    }

    // Lấy flashcard tương ứng
    const reviewFlashcards = reviewProgress.map((up) => up.flashcard)

    // Kiểm tra nếu đã có session thì dùng lại, chưa có thì tạo mới
    let session = await this.studySessionRepository.findActiveSession(user, collection)
    if (!session) {
      session = await this.studySessionRepository.createSession(user, collection)
    }
    // Gán lại flashcards, currentIndex, status
    session.flashcards = reviewFlashcards.map(
      (card: Flashcard): IFlashcardStudy => ({
        id: card.id,
        collection: card.collection,
        term: card.term,
        definition: card.definition,
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
        score: 10
      })
    )
    session.currentIndex = 0
    session.status = Phase.INTRO
    await this.studySessionRepository.save(session)
    // Lấy lại session từ database để đảm bảo đồng bộ
    const dbSession = await this.studySessionRepository.findOneSesstion(user.id, collection.id)
    return this.transformToResponse(dbSession!)
  }

  // Hàm tính toán next_review theo SM-2, giả lập luôn trả lời đúng (quality = 5)
  calculateNextReview(studyCount: number, easeFactor: number): ReviewResult {
    const now = new Date()
    const quality = 5 // luôn giả lập đúng
    // Tính lại EF theo SM-2
    let ef = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ef = Math.max(1.3, ef)
    let interval = 1
    if (studyCount === 1) interval = 1
    else if (studyCount === 2) interval = 2
    else interval = Math.round((studyCount - 1) * ef)
    now.setDate(now.getDate() + interval)
    return {
      next_review: now,
      ease_factor: ef
    }
  }

  async checkReviewAnswer(
    userId: number,
    collectionId: number,
    user: User,
    answer: string
  ): Promise<{
    isCorrect: boolean
    correctAnswer: string
    nextPhase?: IStudySession
  }> {
    const session = await this.studySessionRepository.findOneSesstion(userId, collectionId)
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phiên ôn tập')
    }
    if (session.userId !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập')
    }
    const currentCard = session.flashcards[session.currentIndex]
    if (!currentCard || !currentCard.term) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy thẻ flashcard hiện tại')
    }
    if (!answer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập câu trả lời')
    }
    const isCorrect = answer.toLowerCase().trim() === currentCard.term.toLowerCase().trim()
    let newCurrentIndex = session.currentIndex
    if (isCorrect) {
      if (currentCard) {
        session.flashcards[session.currentIndex] = this.nextPhaseFlashCard(currentCard)
        if (
          session.flashcards[session.currentIndex].intro === true &&
          session.flashcards[session.currentIndex].quiz === true &&
          session.flashcards[session.currentIndex].typing === true
        ) {
          // update UserProgress thay vì tạo mới
          const userProgress = await this.userProgressRepository.findByUserAndFlashcard(user.id, currentCard.id)
          if (userProgress && session.flashcards[session.currentIndex].score === 10) {
            const studyCount = (userProgress.study_count || 0) + 1
            const ef = userProgress.ease_factor || 2.5
            const reviewResult = this.calculateNextReview(studyCount, ef)
            await this.userProgressRepository.updateProgress(userProgress.id, {
              study_count: studyCount,
              next_review: reviewResult.next_review,
              ease_factor: reviewResult.ease_factor
            })
          } else if (userProgress) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            await this.userProgressRepository.updateProgress(userProgress.id, {
              study_count: 0,
              next_review: tomorrow,
              ease_factor: 1.3
            })
          }
          session.score = session.score + session.flashcards[session.currentIndex].score
          session.flashcards = session.flashcards.filter(
            (card) => card.id !== session.flashcards[session.currentIndex].id
          )
        }
      }
      if (session.flashcards.length > 0) {
        newCurrentIndex = this.getRandomIndex(session.currentIndex, session.flashcards.length)
        session.status = this.getCurrentPhase(session.flashcards[newCurrentIndex])
      } else {
        session.flashcards = []
        newCurrentIndex = -1
        session.status = Phase.COMPLETED
      }
    } else {
      if (currentCard) {
        if (session.flashcards[session.currentIndex].score > 0) {
          session.flashcards[session.currentIndex].score -= 2
        }
        const updatedCard = {
          ...currentCard,
          intro: false
        }
        session.flashcards[session.currentIndex] = updatedCard
        session.status = Phase.INTRO
      }
    }
    // Cập nhật session với trạng thái mới
    let updatedSession = await this.studySessionRepository.updateSessionProgress(userId, collectionId, {
      currentIndex: newCurrentIndex,
      status: session.status,
      score: session.score
    })
    // Cập nhật flashcards trong session
    if (updatedSession.flashcards) {
      updatedSession.flashcards = session.flashcards
    }
    updatedSession = await this.studySessionRepository.save(updatedSession)
    return {
      isCorrect,
      correctAnswer: currentCard.term,
      nextPhase: updatedSession
    }
  }
}
