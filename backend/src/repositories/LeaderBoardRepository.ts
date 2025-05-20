import { DeepPartial } from 'typeorm'
import { Leaderboard } from '../entities/LeaderBoard'
import { BaseRepository } from './BaseRepository'
import { ILeaderBoardRequest } from '../interfaces/ILeaderBoard'
import { User } from '../entities/User'

export class LeaderBoardRepository extends BaseRepository<Leaderboard> {
  constructor() {
    super(Leaderboard)
  }

  async findByUser(user: User): Promise<Leaderboard | null> {
    return this.repository.findOne({
      where: { user },
      relations: ['user']
    })
  }

  async createLeaderBoard(data: ILeaderBoardRequest, user: User): Promise<Leaderboard> {
    const leaderboard = this.repository.create({
      ...data,
      user
    } as DeepPartial<Leaderboard>)
    return this.repository.save(leaderboard as Leaderboard)
  }

  async getTopUsers(limit: number): Promise<Leaderboard[]> {
    return this.repository.find({
      relations: ['user'],
      order: {
        total_points: 'DESC'
      },
      take: limit
    })
  }

  async updatePoints(id: number, points: number): Promise<Leaderboard | null> {
    await this.repository.update(id, {
      total_points: points
    })
    return this.findOne(id)
  }
}
