import React from 'react'
import { Button, Space, Typography, Card } from 'antd'
import { TranslationOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoToTranslate = () => {
    navigate('/translate')
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <div
      style={{
        background: '#f0f2f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 32px',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Space align='center'>
          <TranslationOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
            Từ Điển Pro
          </Title>
        </Space>
        <Button
          type='primary'
          size='large'
          style={{
            background: 'linear-gradient(45deg, #1890ff, #40c4ff)',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
          className='hover:scale-105'
          onClick={handleGoToLogin}
        >
          Đăng Nhập
        </Button>
      </header>

      {/* Hero Section */}
      <section
        style={{
          flex: 1,
          padding: '48px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #e6f7ff, #f0f2f5)'
        }}
      >
        <Title
          level={1}
          style={{
            color: '#2c3e50',
            fontWeight: 700,
            marginBottom: '16px'
          }}
        >
          Dịch Ngôn Ngữ Dễ Dàng, Kết Nối Thế Giới
        </Title>
        <Paragraph
          style={{
            fontSize: '18px',
            color: '#555',
            maxWidth: '600px',
            margin: '0 auto 24px'
          }}
        >
          Khám phá công cụ dịch ngôn ngữ mạnh mẽ, hỗ trợ hơn 100 ngôn ngữ với giao diện thân thiện và kết quả chính xác.
        </Paragraph>
        <Button
          type='primary'
          size='large'
          icon={<TranslationOutlined />}
          style={{
            background: 'linear-gradient(45deg, #1890ff, #40c4ff)',
            border: 'none',
            borderRadius: '8px',
            padding: '0 32px',
            height: '48px',
            fontSize: '16px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s'
          }}
          className='hover:scale-105'
          onClick={handleGoToTranslate}
        >
          Bắt Đầu Dịch
        </Button>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '48px 32px',
          background: '#ffffff'
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '32px'
          }}
        >
          Tại Sao Chọn Chúng Tôi?
        </Title>
        <Space
          direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          size='large'
          style={{
            width: '100%',
            justifyContent: 'center',
            gap: '24px'
          }}
        >
          <Card
            hoverable
            style={{
              width: window.innerWidth < 768 ? '100%' : '300px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            className='hover:scale-105'
          >
            <Space direction='vertical' align='center'>
              <TranslationOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={4} style={{ color: '#2c3e50' }}>
                Dịch Nhanh Chóng
              </Title>
              <Text style={{ textAlign: 'center', color: '#555' }}>
                Nhận kết quả dịch tức thì với độ chính xác cao, hỗ trợ văn bản dài và ngắn.
              </Text>
            </Space>
          </Card>
          <Card
            hoverable
            style={{
              width: window.innerWidth < 768 ? '100%' : '300px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            className='hover:scale-105'
          >
            <Space direction='vertical' align='center'>
              <GlobalOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={4} style={{ color: '#2c3e50' }}>
                Đa Ngôn Ngữ
              </Title>
              <Text style={{ textAlign: 'center', color: '#555' }}>
                Hỗ trợ hơn 100 ngôn ngữ, từ phổ biến đến hiếm gặp, đáp ứng mọi nhu cầu.
              </Text>
            </Space>
          </Card>
          <Card
            hoverable
            style={{
              width: window.innerWidth < 768 ? '100%' : '300px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            className='hover:scale-105'
          >
            <Space direction='vertical' align='center'>
              <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <Title level={4} style={{ color: '#2c3e50' }}>
                Thân Thiện Người Dùng
              </Title>
              <Text style={{ textAlign: 'center', color: '#555' }}>
                Giao diện đơn giản, dễ sử dụng, phù hợp với mọi đối tượng người dùng.
              </Text>
            </Space>
          </Card>
        </Space>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '24px 32px',
          background: '#2c3e50',
          textAlign: 'center',
          color: '#fff'
        }}
      >
        <Text style={{ color: '#fff' }}>© 2025 Từ Điển Pro. Mọi quyền được bảo lưu.</Text>
        <div style={{ marginTop: '8px' }}>
          <Text style={{ color: '#d9d9d9' }}>Liên hệ: support@tudienpro.com</Text>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
