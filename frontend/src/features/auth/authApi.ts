// src/features/auth/authApi.ts
import apiClient from '../../utils/apiClient'
import { LoginCredentials } from './authTypes'
import { User } from '../../types/user'

export const loginApi = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
}

export const meApi = async (): Promise<{ user: User }> => {
  const response = await apiClient.get('auth/me')
  return { user: response.data as User }
}
