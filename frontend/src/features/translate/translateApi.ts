import apiClient from '../../utils/apiClient'
import { TranslationRequest, TranslationResponse } from './translatetypes'

export const translateText = async (request: TranslationRequest): Promise<TranslationResponse> => {
  const response = await apiClient.post('/translate', request)
  return response.data
}
