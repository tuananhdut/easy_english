import { CollectionRepository } from '../repositories/CollectionRepository'
import { Collection } from '../entities/Collection'
import { ICollectionRequest } from '../interfaces/ICollection'
import { User } from '../entities/User'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

export class CollectionService {
  private collectionRepository: CollectionRepository

  constructor() {
    this.collectionRepository = new CollectionRepository()
  }

  async createCollection(data: ICollectionRequest, owner: User): Promise<Collection> {
    return this.collectionRepository.createCollection(data, owner)
  }

  async getCollectionById(id: number, user?: User): Promise<Collection> {
    const collection = await this.collectionRepository.findOne(id)
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection not found')
    }

    // Check if user has access to the collection
    if (collection.is_private && (!user || collection.owner.id !== user.id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have access to this collection')
    }

    return collection
  }

  async getUserCollections(user: User): Promise<Collection[]> {
    return this.collectionRepository.findByOwner(user)
  }

  async updateCollection(id: number, data: Partial<ICollectionRequest>, user: User): Promise<Collection> {
    const collection = await this.getCollectionById(id, user)

    // Check if user is the owner
    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update this collection')
    }

    const updatedCollection = await this.collectionRepository.update(id, data)
    if (!updatedCollection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection not found')
    }

    return updatedCollection
  }

  async deleteCollection(id: number, user: User): Promise<void> {
    const collection = await this.getCollectionById(id, user)

    // Check if user is the owner
    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this collection')
    }

    await this.collectionRepository.delete(id)
  }

  async getPublicCollections(): Promise<Collection[]> {
    return this.collectionRepository.findPublicCollections()
  }

  async getUserOwnCollections(user: User): Promise<Collection[]> {
    return this.collectionRepository.findByOwner(user)
  }

  async getUserSharedCollections(
    user: User,
    page: number = 1,
    limit: number = 10
  ): Promise<{ collections: Collection[]; total: number }> {
    return this.collectionRepository.findSharedCollections(user, page, limit)
  }

  async updateTotalFlashcards(id: number, count: number): Promise<Collection | null> {
    return this.collectionRepository.updateTotalFlashcards(id, count)
  }
}
