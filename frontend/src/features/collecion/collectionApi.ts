import apiClient from '../../utils/apiClient'

interface IUser {
  id: number
  username: string
  gmail: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export interface ICollection {
  id: number
  name: string
  description: string
  is_private: boolean
  source_language: string
  target_language: string
  total_flashcards: number
  level: string
  created_at: string
  updated_at: string
  owner: IUser
}

interface ICreateCollectionRequest {
  name: string
  description?: string
  is_private: boolean
  level: string
  source_language?: string
  target_language?: string
}

// Get user's own collections
export const getOwnCollections = async (): Promise<ICollection[]> => {
  const response = await apiClient.get('/collections/user/own')
  return response.data
}

// Create new collection
export const createCollection = async (data: ICreateCollectionRequest): Promise<ICollection> => {
  const response = await apiClient.post('/collections', data)
  return response.data
}

// Get all collections
export const getCollections = async (): Promise<ICollection[]> => {
  const response = await apiClient.get('/collections')
  return response.data
}

// Get collection by ID
export const getCollectionById = async (id: number): Promise<ICollection> => {
  const response = await apiClient.get(`/collections/${id}`)
  return response.data
}

// Update collection
export const updateCollection = async (id: number, data: Partial<ICreateCollectionRequest>): Promise<ICollection> => {
  const response = await apiClient.put(`/collections/${id}`, data)
  return response.data
}

// Delete collection
export const deleteCollection = async (id: number): Promise<void> => {
  await apiClient.delete(`/collections/${id}`)
}

// Get public collections
export const getPublicCollections = async (): Promise<ICollection[]> => {
  const response = await apiClient.get('/collections/public')
  return response.data
}

// Get my collections
export const getMyCollections = async (): Promise<ICollection[]> => {
  const response = await apiClient.get('/collections/my')
  return response.data
}
