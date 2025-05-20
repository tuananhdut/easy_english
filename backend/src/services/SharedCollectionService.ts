import { SharedCollectionRepository } from '../repositories/SharedCollectionRepository'
import { CollectionRepository } from '../repositories/CollectionRepository'
import { UserRepository } from '../repositories/UserRepository'
import { SharedCollection, SharePermission } from '../entities/SharedCollection'
import { ISharedCollectionRequest } from '../interfaces/ISharedCollection'
import { User } from '../entities/User'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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
    const collection = await this.collectionRepository.findOne(data.collection_id)
    if (!collection) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Collection không tồn tại')
    }

    // Check if user is the owner
    if (collection.owner.id !== owner.id) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền chia sẻ collection này')
    }

    // Check if trying to share with owner
    if (data.shared_with_id === owner.id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể chia sẻ với chính mình')
    }

    const sharedWith = await this.userRepository.findOne(data.shared_with_id)
    if (!sharedWith) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
    }

    // Check if already shared
    const existingShare = await this.sharedCollectionRepository.findOneWithOptions({
      where: {
        collection: { id: data.collection_id },
        shared_with: { id: data.shared_with_id }
      }
    })

    if (existingShare) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection đã được chia sẻ với người dùng này')
    }

    return this.sharedCollectionRepository.createSharedCollection(data, collection, sharedWith)
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

  async removeShare(id: number, user: User): Promise<void> {
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

    await this.sharedCollectionRepository.delete(id)
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
