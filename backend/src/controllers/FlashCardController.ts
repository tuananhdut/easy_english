import { NextFunction, Request, Response } from 'express'
import { FlashCardService } from '../services/FlashCardService'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { IFlashCardRequest } from '~/interfaces/IFlashCard'
import { User } from '~/entities/User'

export class FlashCardController {
  private flashCardService: FlashCardService

  constructor() {
    this.flashCardService = new FlashCardService()
    this.createFlashCard = this.createFlashCard.bind(this)
    this.updateFlashCard = this.updateFlashCard.bind(this)
    this.deleteFlashCard = this.deleteFlashCard.bind(this)
    this.getFlashCardsByCollection = this.getFlashCardsByCollection.bind(this)
    this.getRandomFlashCards = this.getRandomFlashCards.bind(this)
  }

  private validateFlashCardRequest(req: Request): IFlashCardRequest {
    const { collection_id, front_text, back_text, image_url, audio_url } = req.body

    if (!collection_id || !front_text || !back_text) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID, front text và back text là bắt buộc')
    }

    return {
      collection_id,
      front_text,
      back_text,
      image_url,
      audio_url
    }
  }

  public async createFlashCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const flashCardData = this.validateFlashCardRequest(req)
      const flashCard = await this.flashCardService.createFlashCard(flashCardData, user)
      new ApiSuccess(flashCard, 'Tạo flashcard thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async updateFlashCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { id } = req.params
      const flashCardData = this.validateFlashCardRequest(req)
      const flashCard = await this.flashCardService.updateFlashCard(Number(id), flashCardData, user)
      new ApiSuccess(flashCard, 'Cập nhật flashcard thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async deleteFlashCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { id } = req.params
      await this.flashCardService.deleteFlashCard(Number(id), user)
      new ApiSuccess(null, 'Xóa flashcard thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getFlashCardsByCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      const flashCards = await this.flashCardService.getFlashCardsByCollection(Number(collectionId), user)
      new ApiSuccess(flashCards, 'Lấy danh sách flashcard thành công').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getRandomFlashCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { collectionId } = req.params
      const { limit = 10 } = req.query
      const flashCards = await this.flashCardService.getRandomFlashCards(Number(collectionId), Number(limit), user)
      new ApiSuccess(flashCards, 'Lấy danh sách flashcard ngẫu nhiên thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}
