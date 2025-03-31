import { StatusCodes } from 'http-status-codes'
import { Repository } from 'typeorm'
import { AppDataSource } from '~/config/data-source'
import { Leaderboard } from '~/entities/LeaderBoard'
import { ApiError } from '~/utils/ApiError'

export default class LeaderBoardService {
  private static instance: LeaderBoardService | null = null
  private leaderboardRepository: Repository<Leaderboard> | null = null

  private constructor() {
    this.leaderboardRepository = AppDataSource.getRepository(Leaderboard)
  }

  public static getInstance(): LeaderBoardService {
    if (!this.instance) {
      this.instance = new LeaderBoardService()
    }
    return this.instance
  }

  public async getLeaderboard(user_id: string): Promise<Leaderboard> {
    const leaderboard = await this.leaderboardRepository?.findOneBy({ id: Number(user_id) })
    if (!leaderboard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Leaderboard not found')
    }
    return leaderboard
  }
}
