export interface SearchParams {
  query: string
  type: number | 1
  site: string | 'dictionary'
  limit?: number
}

export interface SoundParams {
  accent: string
  word: string
}

export interface SoundResponse {
  error: number
  data: string
  id: number
}

export interface SearchDataDictionary {
  select: string
  link: string
  data: string
  value: string
  word: string
  pronunciation: string
  meaning: string
}

export interface DictionaryApiResponse {
  suggestions: SearchDataDictionary[] | null
}
