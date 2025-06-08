import { SharedCollectionRepository } from '../repositories/SharedCollectionRepository'
import { CollectionRepository } from '../repositories/CollectionRepository'
import { UserRepository } from '../repositories/UserRepository'
import { SharedCollection, SharePermission, ShareStatus } from '../entities/SharedCollection'
import { ISharedCollectionRequest } from '../interfaces/ISharedCollection'
import { User } from '../entities/User'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { emailService } from './emailService'
import { signToken, verifyToken } from '~/utils/jwt'

export class SharedCollectionService {
  private sharedCollectionRepository: SharedCollectionRepository
  private collectionRepository: CollectionRepository
  private userRepository: UserRepository

  constructor() {
    this.sharedCollectionRepository = new SharedCollectionRepository()
    this.collectionRepository = new CollectionRepository()
    this.userRepository = new UserRepository()
  }

  async shareCollection(data: ISharedCollectionRequest, owner: User): Promise<SharedCollection> {
    const collection = await this.collectionRepository.findOneWithOptions({
      where: { id: data.collection_id },
      relations: {
        owner: true
      }
    })

    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    if (collection.owner.id !== owner.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền chia sẻ collection này')
    }

    if (data.shared_with_id === owner.id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể chia sẻ với chính mình')
    }

    const sharedWith = await this.userRepository.findOne(data.shared_with_id)
    if (!sharedWith) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
    }

    const existingShare = await this.sharedCollectionRepository.findOneWithOptions({
      where: {
        collection: { id: data.collection_id },
        shared_with: { id: data.shared_with_id }
      }
    })

    if (existingShare) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection đã được chia sẻ với người dùng này')
    }

    // Create shared collection with PENDING status
    const sharedCollection = await this.sharedCollectionRepository.createSharedCollection(data, collection, sharedWith)

    // Generate token for email confirmation
    const token = signToken({
      sharedCollectionId: sharedCollection.id,
      collectionId: collection.id,
      sharedWithId: sharedWith.id
    })

    // Send email notification
    await emailService.sendShareNotification(
      sharedWith.email!,
      collection.name,
      owner.fullName || owner.username || 'Người dùng',
      collection.id,
      token
    )

    return sharedCollection
  }

  async confirmShare(token: string): Promise<SharedCollection> {
    try {
      const decoded = verifyToken(token)

      const sharedCollection = await this.sharedCollectionRepository.findOneWithOptions({
        where: {
          id: decoded.sharedCollectionId,
          collection: { id: decoded.collectionId },
          shared_with: { id: decoded.sharedWithId }
        },
        relations: {
          collection: true,
          shared_with: true
        }
      })

      if (!sharedCollection) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Chia sẻ không tồn tại')
      }

      if (sharedCollection.status === ShareStatus.ACCEPTED) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Chia sẻ đã được xác nhận trước đó')
      }

      // Update status to ACCEPTED
      const updatedShare = await this.sharedCollectionRepository.updateStatus(sharedCollection.id, ShareStatus.ACCEPTED)

      if (!updatedShare) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không thể cập nhật trạng thái chia sẻ')
      }

      return updatedShare
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof Error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
      }
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Token không hợp lệ')
    }
  }

  async updatePermission(id: number, permission: SharePermission, user: User): Promise<SharedCollection> {
    const sharedCollection = await this.sharedCollectionRepository.findOneWithOptions({
      where: {
        id,
        collection: { owner: { id: user.id } }
      },
      relations: {
        collection: {
          owner: true
        }
      }
    })

    if (!sharedCollection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Chia sẻ không tồn tại')
    }

    const updatedShare = await this.sharedCollectionRepository.updatePermission(id, permission)
    if (!updatedShare) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể cập nhật quyền')
    }

    return updatedShare
  }

  async removeShare(collectionId: number, userId: number, user: User): Promise<void> {
    const sharedCollection = await this.sharedCollectionRepository.findOneWithOptions({
      where: {
        collection: { id: collectionId, owner: { id: user.id } },
        shared_with: { id: userId }
      },
      relations: {
        collection: {
          owner: true
        },
        shared_with: true
      }
    })

    if (!sharedCollection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Chia sẻ không tồn tại')
    }

    await this.sharedCollectionRepository.delete(sharedCollection.id)
  }

  async getSharedUsers(collectionId: number, user: User): Promise<SharedCollection[]> {
    const collection = await this.collectionRepository.findOne(collectionId)
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    // Check if user is the owner
    if (collection.owner.id !== user.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem danh sách người dùng được chia sẻ')
    }

    return this.sharedCollectionRepository.findByCollection(collection)
  }
}
