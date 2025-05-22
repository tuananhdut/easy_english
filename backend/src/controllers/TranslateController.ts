import { Request, Response, NextFunction } from 'express'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import TranslateService from '~/services/TranslateService'

export default class TranslateController {
  private translateService: TranslateService

  constructor() {
    this.translateService = TranslateService.getInstance()
    this.translate = this.translate.bind(this)
  }

  public async translate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sourceLanguage, targetLanguage, text } = req.body

      if (!sourceLanguage || !targetLanguage || !text) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Source language, target language, and text are required')
      }

      const result = await this.translateService.translate({
        sourceLanguage,
        targetLanguage,
        text
      })

      new ApiSuccess(result, 'Translation successful').send(res)
    } catch (err) {
      next(err)
    }
  }
}
