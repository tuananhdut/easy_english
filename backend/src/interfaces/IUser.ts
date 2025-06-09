import { UserRole, AuthProvider } from '../entities/User'

export interface IUser {
  id: number
  email: string | null
  username?: string | null
  image?: string | null
  provider: AuthProvider
  role: UserRole
  fullName?: string | null
  googleId?: string
  point: number
  created_at: Date
  updated_at: Date
}

export interface IUserRequest {
  email?: string
  username?: string
  password?: string
  image?: string
  provider?: AuthProvider
  role?: UserRole
  fullName?: string
  googleId?: string
  point?: number
}

export interface IUserResponse {
  id: number
  email: string | null
  fullName: string | null
  image: string | null
  role: UserRole
  point: number
}

export interface IRegisterRequest {
  username: string
  password: string
  email: string | null
  fullName?: string
  role?: UserRole
  point?: number
}

export interface ILoginRequest {
  username: string
  password: string
}

export interface IUpdateUserRequest {
  username?: string
  password?: string
  email?: string
  fullName?: string
  image?: string
  role?: UserRole
  point?: number
}

export interface IGoogleLoginRequest {
  googleId: string
  email: string
  fullName?: string
  image?: string
  provider: AuthProvider
}

export interface IChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface IForgotPasswordRequest {
  email: string
}

export interface IResetPasswordRequest {
  newPassword: string
  confirmPassword: string
  token: string
}

export interface AuthResponse {
  user: IUserResponse
  token: string
}

export interface UserLoginGoogle {
  googleId: string | null
  email: string | null
  fullName: string | null
  image: string | null
}
