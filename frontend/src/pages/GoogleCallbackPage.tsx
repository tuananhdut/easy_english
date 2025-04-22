import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../app/store'
import { me } from '../features/auth/authSlice'
import { notification } from 'antd'

function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      if (token) {
        localStorage.setItem('token', token)
        try {
          const result = await dispatch(me())
          if (result.meta.requestStatus === 'fulfilled') {
            navigate('/dashboard')
          } else {
            notification.error({
              message: 'Đăng nhập thất bại',
              description: 'Không thể lấy thông tin người dùng'
            })
            navigate('/login')
          }
        } catch (error: unknown) {
          notification.error({
            message: 'Đăng nhập thất bại',
            description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý đăng nhập'
          })
          navigate('/login')
        }
      } else {
        notification.error({
          message: 'Đăng nhập thất bại',
          description: 'Không tìm thấy token'
        })
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, dispatch])

  return <p>Đang xử lý đăng nhập Google...</p>
}

export default GoogleCallback
