import axios from 'axios'
import { DictionaryApiResponse, SearchParams } from './dictionarytypes'

const dictionaryUrl = 'https://dict.laban.vn/ajax/autocomplete'

export const searchDictionaryApi = async (params: SearchParams): Promise<DictionaryApiResponse> => {
  try {
    const defaultParams = {
      type: 1,
      site: 'dictionary',
      ...params
    }

    const response = await axios.get(dictionaryUrl, {
      params: defaultParams
    })

    return response.data
  } catch (error) {
    console.error('Error fetching dictionary data:', error)
    throw new Error('Failed to fetch dictionary data')
  }
}
