import { NextFunction, Request, Response } from 'express'
import { StatisticsService } from '../services/statisticsService'
import { ApiError } from '../utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { IUser } from '~/interfaces/IUser'
import { ApiSuccess } from '~/utils/ApiSuccess'

export class StatisticsController {
  private statisticsService: StatisticsService

  constructor() {
    this.statisticsService = new StatisticsService()
  }

  public getLearningStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser

      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
      }

      const statistics = await this.statisticsService.getLearningStatistics(user)
      new ApiSuccess(statistics, 'Lấy danh sách thành công', StatusCodes.ACCEPTED).send(res)
    } catch (error) {
      next(error)
    }
  }

  public getMonthlyLearningStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser

      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
      }

      const statistics = await this.statisticsService.getMonthlyLearningStatistics(user)
      new ApiSuccess(statistics, 'Lấy danh sách thành công', StatusCodes.ACCEPTED).send(res)
    } catch (error) {
      next(error)
    }
  }

  public getConsecutiveLearningDays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser

      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
      }

      const consecutiveDays = await this.statisticsService.getConsecutiveLearningDays(user)
      new ApiSuccess({ consecutiveDays }, 'Lấy số ngày học liên tiếp thành công', StatusCodes.ACCEPTED).send(res)
    } catch (error) {
      next(error)
    }
  }
}
