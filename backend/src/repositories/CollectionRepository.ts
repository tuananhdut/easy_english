import { DeepPartial } from 'typeorm'
import { Collection } from '../entities/Collection'
import { BaseRepository } from './BaseRepository'
import { ICollectionRequest } from '../interfaces/ICollection'
import { User } from '../entities/User'

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super(Collection)
  }

  async findByOwner(owner: User): Promise<Collection[]> {
    return this.repository.find({
      where: { owner },
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        description: true,
        is_private: true,
        created_at: true,
        updated_at: true,
        source_language: true,
        target_language: true,
        total_flashcards: true,
        level: true,
        owner: {
          id: true,
          username: true,
          gmail: true,
          image: true,
          created_at: true,
          updated_at: true
        }
      }
    })
  }

  async findPublicCollections(): Promise<Collection[]> {
    return this.repository.find({
      where: { is_private: false },
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        description: true,
        is_private: true,
        created_at: true,
        updated_at: true,
        source_language: true,
        target_language: true,
        total_flashcards: true,
        level: true,
        owner: {
          id: true,
          username: true,
          gmail: true,
          image: true,
          created_at: true,
          updated_at: true
        }
      }
    })
  }

  async createCollection(data: ICollectionRequest, owner: User): Promise<Collection> {
    const collection = this.repository.create({
      ...data,
      owner
    } as DeepPartial<Collection>)
    return this.repository.save(collection as Collection)
  }

  async updateTotalFlashcards(id: number, count: number): Promise<Collection | null> {
    await this.repository.update(id, { total_flashcards: count })
    return this.findOne(id)
  }

  async findSharedCollections(
    user: User,
    page: number = 1,
    limit: number = 10
  ): Promise<{ collections: Collection[]; total: number }> {
    const skip = (page - 1) * limit

    const [collections, total] = await this.repository.findAndCount({
      relations: ['owner', 'sharedCollections', 'sharedCollections.shared_with'],
      where: {
        sharedCollections: {
          shared_with: user
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        is_private: true,
        created_at: true,
        updated_at: true,
        source_language: true,
        target_language: true,
        total_flashcards: true,
        level: true,
        owner: {
          id: true,
          username: true,
          gmail: true,
          image: true,
          created_at: true,
          updated_at: true
        },
        sharedCollections: {
          id: true,
          permission: true,
          total_points: true,
          created_at: true,
          updated_at: true
        }
      },
      order: {
        updated_at: 'DESC'
      },
      skip,
      take: limit
    })

    return { collections, total }
  }
}
