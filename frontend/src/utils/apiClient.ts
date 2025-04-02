// src/utils/apiClient.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.example.com', // Đổi thành API của bạn
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Có lỗi xảy ra'
    return Promise.reject(new Error(message))
  }
)

export default apiClient
