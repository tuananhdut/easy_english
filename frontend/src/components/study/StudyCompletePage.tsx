import React from 'react'
import { Card, Typography, Button, Space } from 'antd'
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons' // Import necessary icons
// Remove unused imports: TrophyOutlined, useEffect, Row, Col, SoundOutlined, TranslationOutlined, IStudyFlashcard, FILE_URL

const { Title, Text } = Typography

interface StudyCompletePageProps {
  score: number | 0 // Prop to receive the score
  onFinish?: () => void // Optional prop for a finish action, e.g., go back to dictionary
  onGoHome?: () => void // Optional prop for going back to home page
}

const StudyCompletePage: React.FC<StudyCompletePageProps> = ({ score, onFinish, onGoHome }) => {
  // Remove useEffect for audio playback

  return (
    <div
      style={{
        margin: '0 auto',
        background: '#2e3b55',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center vertically
        minHeight: 'calc(100vh - 64px - 48px)' // Adjust height accounting for header/padding
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 600, // Adjust max width for a completion message
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          background: '#3a4760',
          color: 'white',
          overflow: 'hidden',
          textAlign: 'center' // Center content
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} /> {/* Completion icon */}
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            Chúc mừng bạn đã hoàn thành phiên học!
          </Title>
          {/* Display Score */}
          <Card size='small' style={{ background: '#4a5670', borderRadius: '8px', border: 'none', marginTop: 16 }}>
            <Space direction='vertical' size='small'>
              <Text style={{ fontSize: '18px', color: '#b0b0b0' }}>Điểm của bạn:</Text>
              <Title level={1} style={{ margin: 0, color: '#faad14' }}>
                {' '}
                {/* Highlight score */}
                {score}
              </Title>
            </Space>
          </Card>
          {onFinish && (
            <Button
              type='primary'
              size='large'
              onClick={onFinish}
              style={{
                height: 'auto',
                padding: '10px 24px', // Smaller padding
                fontSize: '16px',
                borderRadius: '8px',
                background: '#1890ff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(24,144,255,0.3)',
                color: 'white',
                fontWeight: 'bold',
                marginTop: 24
              }}
            >
              Quay về Từ điển
            </Button>
          )}
          {onGoHome && (
            <Button
              size='large'
              onClick={onGoHome}
              style={{
                height: 'auto',
                padding: '10px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                marginTop: 24
              }}
              icon={<HomeOutlined />}
            >
              Quay về Trang chủ
            </Button>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default StudyCompletePage
