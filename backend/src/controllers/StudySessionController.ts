import { Request, Response, NextFunction } from 'express'
import { StudySessionService } from '../services/StudySessionService'
import { User } from '../entities/User'
import { ApiError } from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { ApiSuccess } from '../utils/ApiSuccess'

export class StudySessionController {
  private studySessionService: StudySessionService

  constructor() {
    this.studySessionService = new StudySessionService()
  }

  public async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.body
      if (!collectionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')
      }

      const session = await this.studySessionService.startSession(user, collectionId)
      new ApiSuccess(session, 'Started study session successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async nextPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      if (!collectionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')
      }

      const session = await this.studySessionService.nextPhase(user.id, Number(collectionId), user)
      new ApiSuccess(session, 'Moved to next phase successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async checkAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      const { answer } = req.body

      if (!collectionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')
      }

      if (!answer) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Answer is required')
      }

      const result = await this.studySessionService.checkAnswer(user.id, Number(collectionId), user, answer)
      new ApiSuccess(result, 'Answer checked successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getPaginatedScores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      if (!collectionId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')
      }

      const result = await this.studySessionService.getPaginatedScores(Number(collectionId), page, limit, user)
      new ApiSuccess(result, 'Get scores successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async startReviewSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

      const { collectionId } = req.body
      if (!collectionId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')

      const session = await this.studySessionService.startReviewSession(user, collectionId)
      new ApiSuccess(session, 'Started review session successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async checkReviewAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')

      const { collectionId } = req.params
      const { answer } = req.body
      if (!collectionId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID is required')
      if (!answer) throw new ApiError(StatusCodes.BAD_REQUEST, 'Answer is required')

      const result = await this.studySessionService.checkReviewAnswer(user.id, Number(collectionId), user, answer)
      new ApiSuccess(result, 'Checked review answer successfully').send(res)
    } catch (err) {
      next(err)
    }
  }
}
