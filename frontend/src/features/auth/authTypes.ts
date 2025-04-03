import { User } from '../../types/user' // Giả sử bạn có file định nghĩa kiểu User ở một nơi khác

// Định nghĩa state của auth
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Định nghĩa payload cho các action
export interface LoginSuccessPayload {
  user: User
  token: string
}

export interface LoginFailurePayload {
  message: string
}

export interface LoginCredentials {
  username: string
  password: string
}
