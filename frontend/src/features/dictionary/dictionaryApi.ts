import apiClient from '../../utils/apiClient'
import { DictionaryApiResponse, SearchParams, SoundParams } from './dictionarytypes'

//{{url}}/dictionary?type=1&site=dictionary&query=he&limit=1
export const searchDictionaryApi = async (params: SearchParams): Promise<DictionaryApiResponse> => {
  const response = await apiClient.get('/dictionary', { params })
  return response.data
}

export const getSoundApi = async (params: SoundParams): Promise<string> => {
  const response = await apiClient.get('/dictionary/sound', { params })
  return response.data.data
}
