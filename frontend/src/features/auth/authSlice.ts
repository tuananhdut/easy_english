// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loginApi, logoutApi } from './authApi'
import { User } from '../../types/user'
import { AuthState, LoginCredentials } from './authTypes'

// 1️⃣ Khởi tạo state ban đầu
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
}

// 2️⃣ Xử lý login (gọi API)
export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    return await loginApi(credentials)
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// 3️⃣ Xử lý logout (gọi API)
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// 4️⃣ Tạo slice xử lý login/logout
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý khi login bắt đầu
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Xử lý khi login thành công
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      // Xử lý khi login thất bại
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Xử lý khi logout thành công
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  }
})

export default authSlice.reducer
