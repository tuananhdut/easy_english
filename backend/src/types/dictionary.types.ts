export interface SearchParams {
  query: string
  type?: number
  site?: string | 'dictionary'
  limit?: number
}

export interface Suggestion {
  select: string
  link: string
  data: string
  value: string
  word?: string
  pronunciation?: string
  meaning?: string
}

export interface DictionaryApiResponse {
  suggestions: Suggestion[]
}
