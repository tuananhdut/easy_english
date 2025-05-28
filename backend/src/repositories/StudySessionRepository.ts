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
        user: { id: user.id },
        collection: { id: collection.id },
        status: Phase.INTRO
      },
      relations: ['user', 'collection']
    })
  }

  async findOne(id: number): Promise<StudySession | null> {
    const session = await this.repository.findOne({
      where: { id },
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
    id: number,
    data: {
      currentIndex?: number
      status?: Phase
      score?: number
    }
  ): Promise<StudySession> {
    await this.repository.update(id, data)
    const session = await this.repository.findOneOrFail({
      where: { id }
      //relations: ['user', 'collection'],
    })

    // Parse flashcards từ JSON string nếu cần
    if (typeof session.flashcards === 'string') {
      session.flashcards = JSON.parse(session.flashcards)
    }

    return session
  }
}
