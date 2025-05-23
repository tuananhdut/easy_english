import { NextFunction, Request, Response } from 'express'
import { FlashCardService } from '~/services/FlashCardService'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { IFlashCardRequest } from '~/interfaces/IFlashCard'
import { User } from '~/entities/User'
import fs from 'fs'
import path from 'path'

export class FlashCardController {
  private flashCardService: FlashCardService

  constructor() {
    this.flashCardService = new FlashCardService()
    this.createFlashCard = this.createFlashCard.bind(this)
    this.updateFlashCard = this.updateFlashCard.bind(this)
    this.deleteFlashCard = this.deleteFlashCard.bind(this)
    this.getFlashCardsByCollection = this.getFlashCardsByCollection.bind(this)
    this.getRandomFlashCards = this.getRandomFlashCards.bind(this)
    this.getSuggestFlashCards = this.getSuggestFlashCards.bind(this)
  }

  private deleteUploadedFiles(files: { image?: Express.Multer.File[]; audio?: Express.Multer.File[] }) {
    if (files.image?.[0]) {
      fs.unlinkSync(files.image[0].path)
    }
    if (files.audio?.[0]) {
      fs.unlinkSync(files.audio[0].path)
    }
  }

  private validateFlashCardRequest(req: Request): IFlashCardRequest {
    const {
      collection_id,
      front_text,
      back_text,
      image_url,
      audio_url,
      pronunciation,
      source_language,
      target_language
    } = req.body

    if (!collection_id || !front_text || !back_text) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Collection ID, front text và back text là bắt buộc')
    }

    return {
      collection_id,
      front_text,
      back_text,
      image_url,
      audio_url,
      pronunciation,
      source_language,
      target_language
    }
  }

  private validateUpdateFlashCardRequest(req: Request): Partial<IFlashCardRequest> {
    const { front_text, back_text, image_url, audio_url, pronunciation } = req.body

    const updateData: Partial<IFlashCardRequest> = {}

    if (front_text !== undefined) updateData.front_text = front_text
    if (back_text !== undefined) updateData.back_text = back_text
    if (image_url !== undefined) updateData.image_url = image_url
    if (audio_url !== undefined) updateData.audio_url = audio_url
    if (pronunciation !== undefined) updateData.pronunciation = pronunciation

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có dữ liệu để cập nhật')
    }

    return updateData
  }

  public async createFlashCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    const files = req.files as {
      image?: Express.Multer.File[]
      audio?: Express.Multer.File[]
    }

    try {
      req.body.image_url = files.image?.[0]?.filename
      req.body.audio_url = files.audio?.[0]?.filename

      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const flashCardData = this.validateFlashCardRequest(req)
      const flashCard = await this.flashCardService.createFlashCard(flashCardData, user)
      new ApiSuccess(flashCard, 'Tạo flashcard thành công').send(res)
    } catch (err) {
      this.deleteUploadedFiles(files)
      next(err)
    }
  }

  public async updateFlashCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    const files = req.files as {
      image?: Express.Multer.File[]
      audio?: Express.Multer.File[]
    }

    try {
      req.body.image_url = files.image?.[0]?.filename
      req.body.audio_url = files.audio?.[0]?.fieldname

      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { id } = req.params
      const flashCardData = this.validateUpdateFlashCardRequest(req)
      const flashCard = await this.flashCardService.updateFlashCard(Number(id), flashCardData, user)
      new ApiSuccess(flashCard, 'Cập nhật flashcard thành công').send(res)
    } catch (err) {
      // Delete uploaded files if update fails
      this.deleteUploadedFiles(files)
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

  public async getSuggestFlashCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User
      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const { query, source, target } = req.query
      const flashCards = await this.flashCardService.getSuggestFlashCards(
        query as string,
        source as string,
        target as string
      )
      new ApiSuccess(flashCards, 'Lấy danh sách flashcard đề xuất thành công').send(res)
    } catch (err) {
      next(err)
    }
  }
}
