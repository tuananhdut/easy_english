import apiClient from '../../utils/apiClient'
import { DictionaryApiResponse, SearchParams, SoundParams, SoundResponse } from './dictionarytypes'
import { IApiResponse } from '../type/resposeType'

//{{url}}/dictionary?type=1&site=dictionary&query=he&limit=1
export const searchDictionaryApi = async (params: SearchParams): Promise<IApiResponse<DictionaryApiResponse>> => {
  const response = await apiClient.get('/dictionary', { params })
  return response.data
}

export const getSoundApi = async (params: SoundParams): Promise<IApiResponse<SoundResponse>> => {
  const response = await apiClient.get('/dictionary/sound', { params })
  return response.data
}
