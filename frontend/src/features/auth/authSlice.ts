import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loginApi, logoutApi, meApi, registerApi } from './authApi'
import { IUser } from '../../types/user'
import { AuthState, IUserRegister, LoginCredentials } from './authTypes'

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
}

// Helper function to handle auth response
const handleAuthResponse = (response: { user: IUser; token: string }) => {
  localStorage.setItem('token', response.token)
  localStorage.setItem('user', JSON.stringify(response.user))
  return response
}

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials)
    return handleAuthResponse(response)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const me = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Không có token')
    const response = await meApi()
    return response
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return rejectWithValue((error as Error).message)
  }
})

export const register = createAsyncThunk('auth/register', async (userRegister: IUserRegister, { rejectWithValue }) => {
  try {
    const response = await registerApi(userRegister)
    return handleAuthResponse(response)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: IUser; token: string }>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Me
      .addCase(me.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(me.fulfilled, (state, action: PayloadAction<{ user: IUser }>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
      })
      .addCase(me.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: IUser; token: string }>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
