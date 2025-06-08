import { NextFunction, Request, Response } from 'express'
import { SharedCollectionService } from '../services/SharedCollectionService'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { ISharedCollectionRequest } from '~/interfaces/ISharedCollection'
import { User } from '~/entities/User'
import { SharePermission } from '~/entities/SharedCollection'

export class SharedCollectionController {
  private sharedCollectionService: SharedCollectionService

  constructor() {
    this.sharedCollectionService = new SharedCollectionService()
    this.shareCollection = this.shareCollection.bind(this)
    this.updatePermission = this.updatePermission.bind(this)
    this.removeShare = this.removeShare.bind(this)
    this.getSharedUsers = this.getSharedUsers.bind(this)
    this.confirmShare = this.confirmShare.bind(this)
  }

  private validateShareRequest(req: Request): ISharedCollectionRequest {
    const { collection_id, shared_with_id, permission } = req.body

    if (!collection_id || !shared_with_id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID và User ID là bắt buộc')
    }

    if (permission && !Object.values(SharePermission).includes(permission)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Quyền không hợp lệ')
    }

    return {
      collection_id,
      shared_with_id,
      permission: permission || SharePermission.VIEW
    }
  }

  public async shareCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const shareData = this.validateShareRequest(req)
      const sharedCollection = await this.sharedCollectionService.shareCollection(shareData, user)
      new ApiSuccess(sharedCollection, 'Chia sẻ collection thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async updatePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { id } = req.params
      const { permission } = req.body

      if (!permission || !Object.values(SharePermission).includes(permission)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Quyền không hợp lệ')
      }

      const sharedCollection = await this.sharedCollectionService.updatePermission(Number(id), permission, user)
      new ApiSuccess(sharedCollection, 'Cập nhật quyền thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async removeShare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId, userId } = req.body
      if (!collectionId || !userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID và User ID là bắt buộc')
      }

      await this.sharedCollectionService.removeShare(Number(collectionId), Number(userId), user)
      new ApiSuccess(null, 'Xóa chia sẻ thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getSharedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      const sharedUsers = await this.sharedCollectionService.getSharedUsers(Number(collectionId), user)
      new ApiSuccess(sharedUsers, 'Lấy danh sách người dùng được chia sẻ thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  async confirmShare(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Confirm share request received')
      console.log('Query params:', req.query)

      const { token } = req.query

      if (!token || typeof token !== 'string') {
        console.log('Invalid token:', token)
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Token không hợp lệ')
      }

      console.log('Processing token:', token)
      const sharedCollection = await this.sharedCollectionService.confirmShare(token)
      console.log('Share confirmed successfully:', sharedCollection)

      new ApiSuccess(sharedCollection, 'Xác nhận chia sẻ thành công').send(res)
    } catch (error) {
      console.error('Error in confirmShare:', error)
      next(error)
    }
  }
}
