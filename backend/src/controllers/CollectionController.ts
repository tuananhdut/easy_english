import { NextFunction, Request, Response } from 'express'
import { CollectionService } from '../services/CollectionService'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { ICollectionRequest } from '~/interfaces/ICollection'
import { User } from '~/entities/User'
import { IUser } from '~/interfaces/IUser'

export class CollectionController {
  private collectionService: CollectionService

  constructor() {
    this.collectionService = new CollectionService()
    this.createCollection = this.createCollection.bind(this)
    this.getCollectionById = this.getCollectionById.bind(this)
    this.updateCollection = this.updateCollection.bind(this)
    this.deleteCollection = this.deleteCollection.bind(this)
    this.getPublicCollections = this.getPublicCollections.bind(this)
    this.getUserOwnCollections = this.getUserOwnCollections.bind(this)
    this.getUserSharedCollections = this.getUserSharedCollections.bind(this)
  }

  private validateCollectionRequest(req: Request, is_update: boolean = false): ICollectionRequest {
    const { name, description, is_private, source_language, target_language, level } = req.body

    if (is_update != true && !name) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên collection là bắt buộc')
    }

    return {
      name,
      description,
      is_private,
      source_language,
      target_language,
      level
    }
  }

  public async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const collectionData = this.validateCollectionRequest(req)
      const collection = await this.collectionService.createCollection(collectionData, user)
      new ApiSuccess(collection, 'Tạo collection thành công', StatusCodes.CREATED).send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getCollectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const user = req.user as IUser
      const collection = await this.collectionService.getCollectionById(Number(id), user)
      new ApiSuccess(collection, 'Lấy thông tin collection thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const updateData = this.validateCollectionRequest(req, true)
      if (updateData.source_language !== undefined) {
        delete updateData.source_language
      }
      if (updateData.target_language !== undefined) {
        delete updateData.target_language
      }

      const collection = await this.collectionService.updateCollection(Number(id), updateData, user)
      new ApiSuccess(collection, 'Cập nhật collection thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async deleteCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      await this.collectionService.deleteCollection(Number(id), user)
      new ApiSuccess(null, 'Xóa collection thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getPublicCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const collections = await this.collectionService.getPublicCollections(page, limit)
      new ApiSuccess(collections, 'Lấy danh sách collections công khai thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getUserOwnCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const collections = await this.collectionService.getUserOwnCollections(user, page, limit)
      new ApiSuccess(collections, 'Lấy danh sách collections của người dùng thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getUserSharedCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.collectionService.getUserSharedCollections(user, page, limit)
      new ApiSuccess(result, 'Lấy danh sách collections được chia sẻ thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}
