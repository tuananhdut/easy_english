import { Form, Input, Button, Typography, notification, Checkbox, Divider } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../app/store'
import { login, googleLogin } from '../features/auth/authSlice'
import { LoginCredentials } from '../features/auth/authTypes'
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading } = useSelector((state: RootState) => state.auth)

  const onFinish = async (values: LoginCredentials) => {
    const result = await dispatch(login(values))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    } else {
      api.error({
        message: 'Đăng nhập thất bại',
        description: JSON.stringify(result.payload) || 'Lỗi khi đăng nhập'
      })
    }
  }

  const handleGoogleLogin = () => {
    dispatch(googleLogin())
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
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid #e8e8e8'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
            Đăng nhập
          </Title>
          <Text type='secondary'>Chào mừng bạn trở lại</Text>
        </div>

        <Form name='login' onFinish={onFinish} layout='vertical'>
          <Form.Item name='username' rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
            <Input
              placeholder='Tên đăng nhập hoặc Email'
              size='large'
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password
              placeholder='Mật khẩu'
              size='large'
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              <a href='/forgot-password'>Quên mật khẩu?</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              block
              size='large'
              loading={loading}
              style={{ height: '48px', fontSize: '16px' }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain>Hoặc</Divider>

          <Form.Item>
            <Button
              block
              size='large'
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#db4437',
                color: '#db4437'
              }}
              icon={<GoogleOutlined style={{ fontSize: '20px' }} />}
              onClick={handleGoogleLogin}
            >
              Đăng nhập với Google
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text type='secondary'>Chưa có tài khoản? </Text>
            <a
              href='/register'
              style={{ fontWeight: '500' }}
              onClick={(e) => {
                e.preventDefault()
                navigate('/register')
              }}
            >
              Đăng ký ngay
            </a>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
