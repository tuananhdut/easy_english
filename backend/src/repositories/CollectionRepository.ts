import { DeepPartial } from 'typeorm'
import { Collection } from '../entities/Collection'
import { BaseRepository } from './BaseRepository'
import { ICollectionRequest } from '../interfaces/ICollection'
import { User } from '../entities/User'
import { IUser } from '~/interfaces/IUser'
import { ShareStatus } from '../entities/SharedCollection'

interface CollectionSelectOptions {
  id: boolean
  name: boolean
  description: boolean
  is_private: boolean
  created_at: boolean
  updated_at: boolean
  source_language: boolean
  target_language: boolean
  total_flashcards: boolean
  level: boolean
  owner: {
    id: boolean
    fullName: boolean
    email: boolean
    image: boolean
    role: boolean
  }
}

const DEFAULT_COLLECTION_SELECT: CollectionSelectOptions = {
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
    fullName: true,
    email: true,
    image: true,
    role: true
  }
}

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super(Collection)
  }

  private getBaseCollectionOptions(relations: string[] = ['owner']): {
    relations: string[]
    select: CollectionSelectOptions
  } {
    return {
      relations,
      select: DEFAULT_COLLECTION_SELECT
    }
  }

  async findByOwner(owner: IUser): Promise<Collection[]> {
    return this.repository.find({
      where: { owner: { id: owner.id } },
      ...this.getBaseCollectionOptions()
    })
  }

  async findPublicCollections(
    page: number = 1,
    limit: number = 10
  ): Promise<{ collections: Collection[]; total: number }> {
    const skip = (page - 1) * limit

    const [collections, total] = await this.repository.findAndCount({
      where: { is_private: false },
      ...this.getBaseCollectionOptions(),
      order: {
        updated_at: 'DESC'
      },
      skip,
      take: limit
    })

    return { collections, total }
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
      ...this.getBaseCollectionOptions(['owner', 'sharedCollections', 'sharedCollections.shared_with']),
      where: {
        sharedCollections: {
          shared_with: user,
          status: ShareStatus.ACCEPTED
        }
      },
      select: {
        ...DEFAULT_COLLECTION_SELECT,
        sharedCollections: {
          id: true,
          permission: true,
          status: true,
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

  async findOwnCollectionsWithPagination(
    owner: IUser,
    page: number = 1,
    limit: number = 10
  ): Promise<{ collections: Collection[]; total: number }> {
    const skip = (page - 1) * limit

    const [collections, total] = await this.repository.findAndCount({
      where: { owner: { id: owner.id } },
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
          fullName: true,
          email: true,
          image: true,
          role: true
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

  async getSharedUsers(collectionId: number): Promise<
    {
      id: number
      fullName: string | null
      email: string | null
      image: string | null
      permission: string
      status: string
    }[]
  > {
    const collection = await this.repository.findOne({
      where: { id: collectionId },
      relations: ['sharedCollections', 'sharedCollections.shared_with'],
      select: {
        id: true,
        sharedCollections: {
          id: true,
          permission: true,
          status: true,
          shared_with: {
            id: true,
            fullName: true,
            email: true,
            image: true
          }
        }
      }
    })

    if (!collection) {
      return []
    }

    return collection.sharedCollections.map((share) => ({
      id: share.shared_with.id,
      fullName: share.shared_with.fullName || null,
      email: share.shared_with.email || null,
      image: share.shared_with.image || null,
      permission: share.permission.toString(),
      status: share.status.toString()
    }))
  }
}
