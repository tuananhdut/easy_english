import apiClient from '../../utils/apiClient'
import { ICreateCollectionRequest } from './collectionType'
import { IApiResponse } from '../type/resposeType'
import { ICollection, ICollectionsResponse } from './collectionType'

// Get user's own collections
export const getOwnCollections = async (): Promise<IApiResponse<ICollectionsResponse>> => {
  const response = await apiClient.get('/collections/user/own')
  return response.data
}

// Create new collection
export const createCollection = async (data: ICreateCollectionRequest): Promise<IApiResponse<ICollection>> => {
  const response = await apiClient.post('/collections', data)
  return response.data
}

// Get all collections
export const getCollections = async (): Promise<IApiResponse<ICollection[]>> => {
  const response = await apiClient.get('/collections')
  return response.data
}

// Get collection by ID
export const getCollectionById = async (id: number): Promise<IApiResponse<ICollection>> => {
  const response = await apiClient.get(`/collections/${id}`)
  return response.data
}

// Update collection
export const updateCollection = async (
  id: number,
  data: Partial<ICreateCollectionRequest>
): Promise<IApiResponse<ICollection>> => {
  const response = await apiClient.put(`/collections/${id}`, data)
  return response.data
}

// Delete collection
export const deleteCollection = async (id: number): Promise<IApiResponse<null>> => {
  const response = await apiClient.delete(`/collections/${id}`)
  return response.data
}

// Get public collections
export const getPublicCollections = async (): Promise<IApiResponse<ICollection[]>> => {
  const response = await apiClient.get('/collections/public')
  return response.data
}

// Get my collections
export const getMyCollections = async (): Promise<IApiResponse<ICollection[]>> => {
  const response = await apiClient.get('/collections/my')
  return response.data
}

// Get shared collections
export const getSharedCollections = async (): Promise<IApiResponse<ICollectionsResponse>> => {
  const response = await apiClient.get('/collections/user/shared')
  return response.data
}
