import { ICreateFlashcardRequest, IUpdateFlashcardRequest, IFlashcard } from './flashcardType'
import apiClient from '../../utils/apiClient'
import { IApiResponse } from '../type/resposeType'

export const createFlashcard = async (data: ICreateFlashcardRequest): Promise<IApiResponse<IFlashcard>> => {
  const formData = new FormData()
  formData.append('collection_id', data.collection_id.toString())
  formData.append('term', data.term)
  formData.append('definition', data.definition)

  if (data.image) {
    formData.append('image', data.image)
  }
  if (data.audio) {
    formData.append('audio', data.audio)
  }

  const response = await apiClient.post(`/flashcards`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const updateFlashcard = async (id: number, data: IUpdateFlashcardRequest): Promise<IApiResponse<IFlashcard>> => {
  const response = await apiClient.put(`/flashcards/${id}`, data)
  return response.data
}
//test

export const deleteFlashcard = async (id: number): Promise<IApiResponse<null>> => {
  const response = await apiClient.delete(`/flashcards/${id}`)
  return response.data
}

export const getFlashcardsByCollection = async (collectionId: number): Promise<IApiResponse<IFlashcard[]>> => {
  const response = await apiClient.get(`/flashcards/collection/${collectionId}`)
  return response.data
}

export const getRandomFlashcards = async (
  collectionId: number,
  excludeId?: number
): Promise<IApiResponse<IFlashcard[]>> => {
  const response = await apiClient.get(
    `/flashcards/collection/${collectionId}/random${excludeId ? `?excludeId=${excludeId}` : ''}`
  )
  return response.data
}
