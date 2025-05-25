import { FlashCardRepository } from '../repositories/FlashCardRepository'
import { CollectionRepository } from '../repositories/CollectionRepository'
import { Flashcard } from '../entities/FlashCard'
import { IFlashCardRequest, IFlashCardResponse } from '../interfaces/IFlashCard'
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

  async createFlashCard(data: IFlashCardRequest, user: User): Promise<IFlashCardResponse> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id: data.collection_id },
      relations: {
        owner: true,
        sharedCollections: {
          shared_with: true
        }
      },
      select: {
        id: true,
        name: true,
        is_private: true,
        total_flashcards: true,
        owner: {
          id: true
        }
      }
    })
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    if (collection.owner.id !== user.id) {
      const hasEditPermission = collection.sharedCollections.some(
        (shared) => shared.shared_with.id === user.id && shared.permission === SharePermission.EDIT
      )
      if (!hasEditPermission) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền tạo flashcard trong collection này')
      }
    }
    if (data.source_language === data.target_language && data.source_language != null) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Ngôn ngữ nguồn và ngôn ngữ mục tiêu không được giống nhau')
    }
    data.is_private = collection.is_private
    const flashcard = await this.flashCardRepository.createFlashCard(data, collection)

    const totalFlashcards = await this.flashCardRepository.findByCollection(collection)
    await this.collectionRepository.updateTotalFlashcards(collection.id, totalFlashcards.length)

    const {
      collection: { id, name },
      ...rest
    } = flashcard
    return { ...rest, collection: { id, name } }
  }

  async updateFlashCard(id: number, data: Partial<IFlashCardRequest>, user: User): Promise<Flashcard> {
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

    //update user leaderboard
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

      if (!hasAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem flashcard trong collection này')
      }
    }
    const flashcard = await this.flashCardRepository.findByCollection(collection)
    return flashcard
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

  async getSuggestFlashCards(query: string, source: string, target: string): Promise<IFlashCardResponse[]> {
    return this.flashCardRepository.findSuggestFlashcards(query, source, target)
  }
}
