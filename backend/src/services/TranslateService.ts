import axios from 'axios'
import { config } from 'dotenv'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

config()

export interface TranslationRequest {
  sourceLanguage: string
  targetLanguage: string
  text: string
}

export interface TranslationResponse {
  translation: string
}

export default class TranslateService {
  private static instance: TranslateService | null = null
  private readonly apiKey: string
  private readonly baseUrl: string

  private constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  }

  public static getInstance(): TranslateService {
    if (!this.instance) {
      this.instance = new TranslateService()
    }
    return this.instance
  }

  public async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.apiKey) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'API key is not configured')
      }

      const prompt = `Hãy dịch văn bản sau từ ${request.sourceLanguage} sang ${request.targetLanguage}.
Chỉ trả về phần văn bản đã được dịch, không kèm theo giải thích hay chú thích nào khác.
Văn bản: "${request.text}"`

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      )
      console.log(response.data)
      const translation = response.data.candidates[0]?.content.parts[0]?.text || ''
      return { translation }
    } catch (error) {
      console.error('Error calling Gemini API for translation:', error)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to translate text. Please try again later.')
    }
  }
}
