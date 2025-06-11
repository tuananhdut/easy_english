import { Phase, StudySession } from '../entities/StudySession'
import { BaseRepository } from './BaseRepository'
import { User } from '../entities/User'
import { Collection } from '../entities/Collection'

export class StudySessionRepository extends BaseRepository<StudySession> {
  constructor() {
    super(StudySession)
  }

  async createSession(user: User, collection: Collection): Promise<StudySession> {
    const session = this.repository.create({
      userId: user.id,
      collectionId: collection.id,
      user,
      collection,
      currentIndex: 0,
      status: Phase.INTRO,
      startTime: new Date()
    })
    return this.repository.save(session)
  }

  async save(session: StudySession): Promise<StudySession> {
    return this.repository.save(session)
  }

  async findActiveSession(user: User, collection: Collection): Promise<StudySession | null> {
    return this.repository.findOne({
      where: {
        userId: user.id,
        collectionId: collection.id
      },
      relations: ['user', 'collection']
    })
  }

  async findOneSesstion(userId: number, collectionId: number): Promise<StudySession | null> {
    const session = await this.repository.findOne({
      where: {
        userId,
        collectionId
      },
      relations: ['user', 'collection']
    })

    if (session) {
      // Parse flashcards từ JSON string nếu cần
      if (typeof session.flashcards === 'string') {
        session.flashcards = JSON.parse(session.flashcards)
      }
    }

    return session
  }

  async updateSessionProgress(
    userId: number,
    collectionId: number,
    data: {
      currentIndex?: number
      status?: Phase
      score?: number
    }
  ): Promise<StudySession> {
    await this.repository.update({ userId, collectionId }, data)
    const session = await this.repository.findOneOrFail({
      where: { userId, collectionId },
      relations: ['user', 'collection']
    })

    // Parse flashcards từ JSON string nếu cần
    if (typeof session.flashcards === 'string') {
      session.flashcards = JSON.parse(session.flashcards)
    }

    return session
  }

  async findScoresByCollection(
    collectionId: number,
    page: number,
    limit: number
  ): Promise<{ sessions: StudySession[]; total: number }> {
    const [sessions, total] = await this.repository.findAndCount({
      where: { collectionId },
      relations: ['user'],
      order: { score: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    })
    return { sessions, total }
  }

  async findUserRank(collectionId: number, userId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('session')
      .where('session.collectionId = :collectionId', { collectionId })
      .andWhere(
        'session.score > (SELECT score FROM study_sessions WHERE userId = :userId AND collectionId = :collectionId)',
        {
          userId,
          collectionId
        }
      )
      .getCount()
    return result + 1
  }
}
