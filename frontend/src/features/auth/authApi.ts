import apiClient from '../../utils/apiClient'
import { LoginCredentials, IAuthData, IUserRegister } from './authTypes'
import { IUser } from '../user/userType'
import { IApiResponse } from '../type/resposeType'

export const loginApi = async (credentials: LoginCredentials): Promise<IApiResponse<IAuthData>> => {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export const logoutApi = async (): Promise<IApiResponse<null>> => {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

export const meApi = async (): Promise<IApiResponse<{ user: IUser }>> => {
  const response = await apiClient.get('auth/me')
  return response.data
}

export const registerApi = async (userRegister: IUserRegister): Promise<IApiResponse<IAuthData>> => {
  const response = await apiClient.post('auth/register', userRegister)
  return response.data
}

export const initiateGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google-login`
}
