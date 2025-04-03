import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loginApi, logoutApi, meApi } from './authApi'
import { User } from '../../types/user'
import { AuthState, LoginCredentials } from './authTypes'

const initialState: AuthState = {
  isAuthenticated: false, // Không lấy từ localStorage ở đây
  user: null,
  token: null,
  loading: false,
  error: null
}

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials)

    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    console.log('check login', response)
    return response
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

// Thunk xử lý logout
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return rejectWithValue((error as Error).message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(me.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
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
  }
})

export default authSlice.reducer
