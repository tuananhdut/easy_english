export interface TranslationRequest {
  sourceLanguage: string
  targetLanguage: string
  text: string
}

export interface TranslationResponse {
  translation: string
}
