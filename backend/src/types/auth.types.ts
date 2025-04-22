import { UserRole } from '../entities/User'

export interface IUserResponse {
  id: string
  email: string | null
  name: string | null
  avatar?: string | null
  role: UserRole
}

export interface AuthResponse {
  user: IUserResponse
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}
