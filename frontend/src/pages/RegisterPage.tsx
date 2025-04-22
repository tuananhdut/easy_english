import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined, GoogleOutlined } from '@ant-design/icons'
import { Form, Input, Button, Typography, Divider, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../app/store'
import { IUserRegister } from '../features/auth/authTypes'
import { register } from '../features/auth/authSlice'

const { Title, Text } = Typography

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const onFinish = async (userRegister: IUserRegister) => {
    const result = await dispatch(register(userRegister))

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard')
    }
  }

  const handleGoogleRegister = () => {
    // Xử lý đăng ký bằng Google
    message.info('Đăng ký bằng Google')
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
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid #e8e8e8'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
            Đăng ký tài khoản
          </Title>
          <Text type='secondary'>Tạo tài khoản để bắt đầu trải nghiệm</Text>
        </div>

        <Form form={form} name='register' onFinish={onFinish} layout='vertical' scrollToFirstError>
          <Form.Item
            name='fullName'
            label='Họ và tên'
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { min: 6, message: 'Họ tên phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input
              size='large'
              placeholder='Nguyễn Văn A'
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item
            name='username'
            label='Tên đăng nhập'
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới!' }
            ]}
          >
            <Input size='large' placeholder='username' />
          </Form.Item>

          <Form.Item name='gmail' label='Email' rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input
              size='large'
              placeholder='example@email.com'
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item
            name='password'
            label='Mật khẩu'
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
            hasFeedback
          >
            <Input.Password
              size='large'
              placeholder='Mật khẩu mạnh'
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item
            name='confirm'
            label='Xác nhận mật khẩu'
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                }
              })
            ]}
          >
            <Input.Password
              size='large'
              placeholder='Nhập lại mật khẩu'
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
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
              Đăng ký
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
              onClick={handleGoogleRegister}
            >
              Đăng ký với Google
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button type='link' icon={<ArrowLeftOutlined />} onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
