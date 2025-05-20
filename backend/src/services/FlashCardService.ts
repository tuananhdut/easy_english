import { FlashCardRepository } from '../repositories/FlashCardRepository'
import { CollectionRepository } from '../repositories/CollectionRepository'
import { Flashcard } from '../entities/FlashCard'
import { IFlashCardRequest } from '../interfaces/IFlashCard'
import { User } from '../entities/User'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { SharePermission } from '../entities/SharedCollection'

export class FlashCardService {
  private flashCardRepository: FlashCardRepository
  private collectionRepository: CollectionRepository

  constructor() {
    this.flashCardRepository = new FlashCardRepository()
    this.collectionRepository = new CollectionRepository()
  }

  async createFlashCard(data: IFlashCardRequest, user: User): Promise<Flashcard> {
    const collection = await this.collectionRepository.findOne(data.collection_id)
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    // Check if user is the owner or has edit permission
    if (collection.owner.id !== user.id) {
      const sharedCollection = await this.collectionRepository.findOneWithOptions({
        where: {
          id: data.collection_id,
          sharedCollections: {
            shared_with: { id: user.id },
            permission: SharePermission.EDIT
          }
        },
        relations: {
          owner: true,
          sharedCollections: {
            shared_with: true
          }
        }
      })

      if (!sharedCollection) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thêm flashcard vào collection này')
      }
    }

    const flashCard = await this.flashCardRepository.createFlashCard(data, collection)

    // Update total flashcards count
    const totalFlashcards = await this.flashCardRepository.findByCollection(collection)
    await this.collectionRepository.updateTotalFlashcards(collection.id, totalFlashcards.length)

    return flashCard
  }

  async updateFlashCard(id: number, data: IFlashCardRequest, user: User): Promise<Flashcard> {
    const flashCard = await this.flashCardRepository.findOneWithOptions({
      where: { id },
      relations: {
        collection: {
          owner: true,
          sharedCollections: {
            shared_with: true
          }
        }
      }
    })

    if (!flashCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flashcard không tồn tại')
    }

    // Check if user is the owner or has edit permission
    if (flashCard.collection.owner.id !== user.id) {
      const hasEditPermission = flashCard.collection.sharedCollections.some(
        (shared) => shared.shared_with.id === user.id && shared.permission === SharePermission.EDIT
      )

      if (!hasEditPermission) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền chỉnh sửa flashcard này')
      }
    }

    const updatedFlashCard = await this.flashCardRepository.update(id, data)
    if (!updatedFlashCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể cập nhật flashcard')
    }

    return updatedFlashCard
  }

  async deleteFlashCard(id: number, user: User): Promise<void> {
    const flashCard = await this.flashCardRepository.findOneWithOptions({
      where: { id },
      relations: {
        collection: {
          owner: true,
          sharedCollections: {
            shared_with: true
          }
        }
      }
    })

    if (!flashCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flashcard không tồn tại')
    }

    // Check if user is the owner or has edit permission
    if (flashCard.collection.owner.id !== user.id) {
      const hasEditPermission = flashCard.collection.sharedCollections.some(
        (shared) => shared.shared_with.id === user.id && shared.permission === SharePermission.EDIT
      )

      if (!hasEditPermission) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xóa flashcard này')
      }
    }

    await this.flashCardRepository.delete(id)

    // Update total flashcards count
    const totalFlashcards = await this.flashCardRepository.findByCollection(flashCard.collection)
    await this.collectionRepository.updateTotalFlashcards(flashCard.collection.id, totalFlashcards.length)
  }

  async getFlashCardsByCollection(collectionId: number, user: User): Promise<Flashcard[]> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id: collectionId },
      relations: {
        owner: true,
        sharedCollections: {
          shared_with: true
        }
      }
    })

    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    // Check if user is the owner or has view permission
    if (collection.owner.id !== user.id) {
      const hasAccess = collection.sharedCollections.some((shared) => shared.shared_with.id === user.id)

      if (!hasAccess && collection.is_private) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem flashcard trong collection này')
      }
    }

    return this.flashCardRepository.findByCollection(collection)
  }

  async getRandomFlashCards(collectionId: number, limit: number, user: User): Promise<Flashcard[]> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id: collectionId },
      relations: {
        owner: true,
        sharedCollections: {
          shared_with: true
        }
      }
    })

    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    // Check if user is the owner or has view permission
    if (collection.owner.id !== user.id) {
      const hasAccess = collection.sharedCollections.some((shared) => shared.shared_with.id === user.id)

      if (!hasAccess && collection.is_private) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem flashcard trong collection này')
      }
    }

    return this.flashCardRepository.findRandomFlashcards(collection, limit)
  }
}
