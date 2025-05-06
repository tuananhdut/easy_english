export interface SearchParams {
  query: string
  type?: number
  site?: string
}

export interface DictionaryApiResponse {
  suggestions?: string[] // Danh sách gợi ý từ
  data?: {
    word: string
    meaning: string
    pronunciation?: string
    examples?: string[]
  }[]
}
