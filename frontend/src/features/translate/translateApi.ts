import apiClient from '../../utils/apiClient'
import { TranslationRequest, TranslationResponse } from './translateTypes'
import { IApiResponse } from '../type/resposeType'

export const translateText = async (request: TranslationRequest): Promise<IApiResponse<TranslationResponse>> => {
  const response = await apiClient.post('/translate', request)
  return response.data
}
