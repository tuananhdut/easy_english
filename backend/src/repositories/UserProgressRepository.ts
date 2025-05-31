import { DeepPartial, LessThanOrEqual } from 'typeorm'
import { UserProgress } from '../entities/UserProgress'
import { BaseRepository } from './BaseRepository'
import { IUserProgressRequest } from '../interfaces/IUserProgress'
import { User } from '../entities/User'
import { Flashcard } from '../entities/FlashCard'

export class UserProgressRepository extends BaseRepository<UserProgress> {
  constructor() {
    super(UserProgress)
  }

  async findByUserAndFlashcard(user: User, flashcard: Flashcard): Promise<UserProgress | null> {
    return this.repository.findOne({
      where: { user, flashcard },
      relations: ['user', 'flashcard']
    })
  }

  async findByUser(user: User): Promise<UserProgress[]> {
    return this.repository.find({
      where: { user },
      relations: ['user', 'flashcard']
    })
  }

  async createUserProgress(data: IUserProgressRequest, user: User, flashcard: Flashcard): Promise<UserProgress> {
    const now = new Date()
    const next_review = new Date(now)
    next_review.setDate(now.getDate() + 1)

    const progress = this.repository.create({
      ...data,
      user,
      flashcard,
      next_review
    } as DeepPartial<UserProgress>)
    return this.repository.save(progress as UserProgress)
  }

  async getDueFlashcards(user: User): Promise<UserProgress[]> {
    const now = new Date()
    return this.repository.find({
      where: {
        user,
        next_review: LessThanOrEqual(now)
      },
      relations: ['user', 'flashcard']
    })
  }

  async updateProgress(id: number, data: Partial<IUserProgressRequest>): Promise<UserProgress | null> {
    await this.repository.update(id, {
      ...data
    })
    return this.findOne(id)
  }
}
