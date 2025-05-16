import { Request, Response, NextFunction } from 'express'
import { ApiSuccess } from '~/utils/ApiSuccess'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import DictionaryService from '~/services/DictionaryService'
import { SearchParams } from '~/types/dictionary.types'

export default class DictionaryController {
  private dictionaryService: DictionaryService

  constructor() {
    this.dictionaryService = DictionaryService.getInstance()
    this.getSerchDictionary = this.getSerchDictionary.bind(this)
    this.getSound = this.getSound.bind(this)
  }

  public async getSerchDictionary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, type, site, limit } = req.query

      if (!query) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Query parameter is required')
      }

      const params: SearchParams = {
        query: query as string,
        type: type ? Number(type) : undefined,
        site: site as string | 'dictionary',
        limit: limit ? Number(limit) : undefined
      }

      const result = await this.dictionaryService.getDictionary(params)
      new ApiSuccess(result, 'Get dictionary successfully').send(res)
    } catch (err) {
      next(err)
    }
  }

  public async getSound(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accent, word } = req.query

      if (!accent || !word) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Accent and word parameters are required')
      }

      const newWord = (word as string).toLocaleLowerCase()

      const result = await this.dictionaryService.getSound(accent as string, newWord)
      new ApiSuccess(result, 'Get sound successfully').send(res)
    } catch (err) {
      next(err)
    }
  }
}
