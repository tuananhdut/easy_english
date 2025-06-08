import { CollectionRepository } from '../repositories/CollectionRepository'
import { Collection } from '../entities/Collection'
import { ICollectionRequest, ICollectionResponse } from '../interfaces/ICollection'
import { User } from '../entities/User'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { FlashCardRepository } from '../repositories/FlashCardRepository'
import { UserProgressRepository } from '../repositories/UserProgressRepository'
import { IUser } from '~/interfaces/IUser'

interface PaginationParams {
  page: number
  limit: number
}

interface PaginatedResponse<T> {
  collections: T[]
  total: number
}

export class CollectionService {
  private collectionRepository: CollectionRepository
  private flashCardRepository: FlashCardRepository
  private userProgressRepository: UserProgressRepository

  constructor() {
    this.collectionRepository = new CollectionRepository()
    this.flashCardRepository = new FlashCardRepository()
    this.userProgressRepository = new UserProgressRepository()
  }

  private validatePaginationParams(params: PaginationParams): PaginationParams {
    return {
      page: Math.max(1, Math.floor(params.page)),
      limit: Math.max(1, Math.min(100, Math.floor(params.limit)))
    }
  }

  private async getCollectionStudyProgress(
    collection: Collection,
    user: User
  ): Promise<{ learnedWords: number; reviewWords: number }> {
    const flashcards = await this.flashCardRepository.findByCollection(collection)
    const flashcardIds = flashcards.map((f) => f.id)

    const userProgress = await this.userProgressRepository.findByUser(user)
    const collectionProgress = userProgress.filter((up) => flashcardIds.includes(up.flashcard.id))

    const learnedWords = collectionProgress.length
    const reviewWords = collectionProgress.filter((up) => up.next_review && up.next_review <= new Date()).length

    return { learnedWords, reviewWords }
  }

  private transformOwnerData(owner: User) {
    return {
      id: owner.id,
      fullName: owner.fullName || '',
      email: owner.email || '',
      image: owner.image || ''
    }
  }

  private transformCollectionToResponse(
    collection: Collection,
    studyProgress: { learnedWords: number; reviewWords: number }
  ): ICollectionResponse {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      is_private: collection.is_private,
      source_language: collection.source_language,
      target_language: collection.target_language,
      total_flashcards: collection.total_flashcards,
      level: collection.level,
      created_at: collection.created_at,
      updated_at: collection.updated_at,
      owner: this.transformOwnerData(collection.owner),
      learnedWords: studyProgress.learnedWords,
      reviewWords: studyProgress.reviewWords,
      sharedUsersCount: collection.sharedCollections?.length || 0,
      permission: collection.sharedCollections?.[0]?.permission
    }
  }

  async createCollection(data: ICollectionRequest, owner: User): Promise<ICollectionResponse> {
    const collection = await this.collectionRepository.createCollection(data, owner)
    const studyProgress = await this.getCollectionStudyProgress(collection, owner)
    return this.transformCollectionToResponse(collection, studyProgress)
  }

  async getCollectionById(id: number, user?: IUser): Promise<ICollectionResponse> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id },
      relations: {
        owner: true
      }
    })
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection not found')
    }

    if (collection.is_private && (!user || collection.owner.id !== user.id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have access to this collection')
    }

    const studyProgress = user
      ? await this.getCollectionStudyProgress(collection, user as User)
      : { learnedWords: 0, reviewWords: 0 }
    return this.transformCollectionToResponse(collection, studyProgress)
  }

  async updateCollection(id: number, data: Partial<ICollectionRequest>, user: User): Promise<ICollectionResponse> {
    const collection = await this.getCollectionById(id, user)

    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update this collection')
    }

    const mergedData = {
      ...collection,
      ...data,
      name: data.name || collection.name,
      description: data.description || collection.description,
      googleId: data.is_private || collection.is_private,
      provider: data.level || collection.level
    }

    const updatedCollection = await this.collectionRepository.update(id, mergedData)
    if (!updatedCollection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection not found')
    }
    const studyProgress = await this.getCollectionStudyProgress(updatedCollection, user)
    return this.transformCollectionToResponse(updatedCollection, studyProgress)
  }

  async deleteCollection(id: number, user: User): Promise<void> {
    const collection = await this.getCollectionById(id, user)

    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this collection')
    }

    await this.collectionRepository.delete(id)
  }

  async getPublicCollections(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ICollectionResponse>> {
    const { page: validPage, limit: validLimit } = this.validatePaginationParams({ page, limit })
    const result = await this.collectionRepository.findPublicCollections(validPage, validLimit)

    const collectionsWithProgress = await Promise.all(
      result.collections.map(async (collection: Collection) => {
        const studyProgress = await this.getCollectionStudyProgress(collection, collection.owner)
        return this.transformCollectionToResponse(collection, studyProgress)
      })
    )

    return {
      collections: collectionsWithProgress,
      total: result.total
    }
  }

  async getUserOwnCollections(
    user: IUser,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<ICollectionResponse>> {
    const { page: validPage, limit: validLimit } = this.validatePaginationParams({ page, limit })
    const result = await this.collectionRepository.findOwnCollectionsWithPagination(user, validPage, validLimit)

    const collectionsWithProgress = await Promise.all(
      result.collections.map(async (collection: Collection) => {
        const studyProgress = await this.getCollectionStudyProgress(collection, user as User)
        return this.transformCollectionToResponse(collection, studyProgress)
      })
    )

    return {
      collections: collectionsWithProgress,
      total: result.total
    }
  }

  async getUserSharedCollections(
    user: User,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<ICollectionResponse>> {
    const { page: validPage, limit: validLimit } = this.validatePaginationParams({ page, limit })
    const result = await this.collectionRepository.findSharedCollections(user, validPage, validLimit)

    const collectionsWithProgress = await Promise.all(
      result.collections.map(async (collection: Collection) => {
        const studyProgress = await this.getCollectionStudyProgress(collection, user)
        return this.transformCollectionToResponse(collection, studyProgress)
      })
    )

    return {
      collections: collectionsWithProgress,
      total: result.total
    }
  }

  async updateTotalFlashcards(id: number, count: number): Promise<ICollectionResponse | null> {
    const collection = await this.collectionRepository.updateTotalFlashcards(id, count)
    if (!collection) return null

    const studyProgress = await this.getCollectionStudyProgress(collection, collection.owner)
    return this.transformCollectionToResponse(collection, studyProgress)
  }

  async getSharedUsers(
    collectionId: number,
    user: User
  ): Promise<
    { id: number; fullName: string | null; email: string | null; image: string | null; permission: string }[]
  > {
    const collection = await this.getCollectionById(collectionId, user)

    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem danh sách người dùng được chia sẻ')
    }

    return this.collectionRepository.getSharedUsers(collectionId)
  }
}
