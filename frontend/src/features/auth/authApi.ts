import apiClient from '../../utils/apiClient'
import { LoginCredentials, IAuthData, IUserRegister } from './authTypes'
import { IUser } from '../../types/user'

export const loginApi = async (credentials: LoginCredentials): Promise<IAuthData> => {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
}

export const meApi = async (): Promise<{ user: IUser }> => {
  const response = await apiClient.get('auth/me')
  return response.data
}

export const registerApi = async (userRegister: IUserRegister): Promise<IAuthData> => {
  const response = await apiClient.post('auth/register', userRegister)
  return response.data
}

export const initiateGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google-login`
}
