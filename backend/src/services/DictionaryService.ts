import axios from 'axios'
import { DictionaryApiResponse, SearchParams, Suggestion } from '~/interfaces/IDictionary'

interface ParsedData {
  word: string
  pronunciation?: string
  meaning?: string
}

const extractDataFromHtml = (html: string): ParsedData => {
  try {
    // Lấy từ vựng từ thẻ span có class="fl"
    const wordRegex = /<span class="fl">.*?<span class="hl">(.*?)<\/span>/i
    const wordMatch = html.match(wordRegex)
    const word = wordMatch && wordMatch[1] ? wordMatch[1].trim() : ''

    // Lấy phiên âm từ thẻ span có class="fr hl"
    const pronunciationRegex = /<span class="fr hl" >(.*?)<img/i
    const pronunciationMatch = html.match(pronunciationRegex)
    const pronunciation =
      pronunciationMatch && pronunciationMatch[1] ? pronunciationMatch[1].replace(/[/]/g, '').trim() : undefined

    // Lấy nghĩa từ thẻ p
    const meaningRegex = /<p>(.*?)<\/p>/i
    const meaningMatch = html.match(meaningRegex)
    const meaning = meaningMatch && meaningMatch[1] ? meaningMatch[1].trim() : undefined

    return {
      word,
      pronunciation,
      meaning
    }
  } catch (error) {
    console.error('Error extracting data from HTML:', error)
    return {
      word: '',
      pronunciation: undefined,
      meaning: undefined
    }
  }
}

export default class DictionaryService {
  private static instance: DictionaryService | null = null
  private dictionaryUrl = 'https://dict.laban.vn/ajax'

  private constructor() {}

  public static getInstance(): DictionaryService {
    if (!this.instance) {
      this.instance = new DictionaryService()
    }
    return this.instance
  }

  public async getDictionary(params: SearchParams): Promise<DictionaryApiResponse> {
    try {
      const response = await axios.get(this.dictionaryUrl + '/autocomplete', {
        params: {
          type: 1,
          site: 'dictionary',
          ...params
        }
      })

      let suggestions = (response.data.suggestions || []).map((suggestion: Suggestion) => {
        const parsedData = extractDataFromHtml(suggestion.data)
        return {
          ...suggestion,
          word: parsedData.word,
          pronunciation: parsedData.pronunciation,
          meaning: parsedData.meaning
        }
      })

      // Giới hạn số lượng kết quả nếu có limit
      if (params.limit && params.limit > 0) {
        suggestions = suggestions.slice(0, params.limit)
      }

      const data: DictionaryApiResponse = {
        suggestions
      }
      return data
    } catch (error) {
      console.error('Error fetching dictionary data:', error)
      throw new Error('Failed to fetch dictionary data')
    }
  }

  public async getSound(accent: string, word: string): Promise<string> {
    try {
      const response = await axios.get(this.dictionaryUrl + '/getsound', {
        params: {
          accent,
          word
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching dictionary data:', error)
      throw new Error('Failed to fetch dictionary data')
    }
  }
}
