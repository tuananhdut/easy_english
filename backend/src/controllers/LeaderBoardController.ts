import LeaderBoardService from '~/services/LeaderBoardService'
import { Request, Response, NextFunction } from 'express'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

export default class LeaderBoardController {
  private leaderboardService: LeaderBoardService

  constructor() {
    this.leaderboardService = LeaderBoardService.getInstance()
    this.getLeaderboard = this.getLeaderboard.bind(this)
  }

  public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { id?: string | null } | null
      if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }
      const user_id = user.id
      const leaderboard = await this.leaderboardService.getLeaderboard(user_id)
      new ApiSuccess(leaderboard, 'Get leaderboard successfully').send(res)
    } catch (err) {
      next(err)
    }
  }
}
