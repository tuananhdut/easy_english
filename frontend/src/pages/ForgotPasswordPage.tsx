import React, { useState } from 'react'
import { Form, Input, Button, notification, Card, Typography, Space } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const { Title, Text } = Typography

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email) {
      notification.error({ message: 'Vui lòng nhập email!' })
      return
    }

    setLoading(true)
    try {
      // Gửi yêu cầu quên mật khẩu đến backend
      const response = await axios.post('/api/forgot-password', { email })
      notification.success({ message: response.data.message })
    } catch (error) {
      notification.error({ message: (axios.isAxiosError(error) && error.response?.data?.message) || 'Đã xảy ra lỗi!' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: 'none'
        }}
      >
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
              Quên Mật Khẩu
            </Title>
            <Text type='secondary'>Nhập email của bạn để nhận liên kết đặt lại mật khẩu</Text>
          </div>

          <Form name='forgot_password' onFinish={handleSubmit} layout='vertical' size='large'>
            <Form.Item
              name='email'
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder='Email của bạn'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                block
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #1890ff, #40c4ff)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Gửi Yêu Cầu
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button
                type='link'
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/login')}
                style={{ color: '#1890ff' }}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
