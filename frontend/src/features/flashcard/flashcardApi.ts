import { ICreateFlashcardRequest, IUpdateFlashcardRequest, IDeleteFlashcardResponse, IFlashcard } from './flashcardType'
import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'

export const createFlashcard = async (data: ICreateFlashcardRequest): Promise<IApiResponse<IFlashcard>> => {
  const response = await apiClient.post(`/flashcards`, data)
  return response.data
}

export const updateFlashcard = async (id: number, data: IUpdateFlashcardRequest): Promise<IApiResponse<IFlashcard>> => {
  const response = await apiClient.put(`/flashcards/${id}`, data)
  return response.data
}

export const deleteFlashcard = async (id: number): Promise<IApiResponse<null>> => {
  const response = await apiClient.delete(`/flashcards/${id}`)
  return response.data
}

export const deleteCollectionFlashcards = async (collectionId: number): Promise<IDeleteFlashcardResponse> => {
  const response = await apiClient.delete(`/flashcards/collection/${collectionId}`)
  return response.data
}
