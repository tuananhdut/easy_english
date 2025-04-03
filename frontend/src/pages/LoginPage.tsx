import React from 'react'
import { Form, Input, Button, Typography, notification } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../app/store'
import { login } from '../features/auth/authSlice'
import { LoginCredentials } from '../features/auth/authTypes'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

const LoginPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading } = useSelector((state: RootState) => state.auth) // Không lấy `error` từ Redux

  const onFinish = async (values: LoginCredentials) => {
    const result = await dispatch(login(values))

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    } else {
      console.log(result)
      api.error({
        message: 'Đăng nhập thất bại',
        description: JSON.stringify(result.payload) || 'lỗi khi đăng nhập'
      })
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px'
      }}
    >
      {contextHolder}
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid #e8e8e8'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Đăng nhập
        </Title>
        <Form name='login' onFinish={onFinish} layout='vertical'>
          <Form.Item name='username' rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input placeholder='Tên đăng nhập' size='large' />
          </Form.Item>
          <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password placeholder='Mật khẩu' size='large' />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' block size='large' loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
