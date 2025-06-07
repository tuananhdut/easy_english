import { IUser } from '../user/userType'

// Định nghĩa state của auth
export interface AuthState {
  isAuthenticated: boolean
  user: IUser | null
  token: string | null
  loading: boolean
  error: string | null
}

export interface IAuthData {
  user: IUser
  token: string
}

export interface LoginFailurePayload {
  message: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface IUserRegister {
  username: string
  email: string
  fullName: string
  password: string
}

export interface ISearchUsersResponse {
  users: IUser[]
}
