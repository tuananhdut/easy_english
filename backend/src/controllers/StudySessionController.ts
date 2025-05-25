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

  public async checkAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { sessionId } = req.params
      const { answer } = req.body

      if (!answer) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Answer is required')
      }
      const result = await this.studySessionService.checkAnswer(Number(sessionId), user, answer)
      new ApiSuccess(result, 'Answer checked successfully').send(res)
    } catch (err) {
      next(err)
    }
  }
}
