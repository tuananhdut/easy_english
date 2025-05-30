import React, { useEffect } from 'react'
import { Card, Typography, Button, Space, Row, Col } from 'antd'
import { SoundOutlined, TranslationOutlined } from '@ant-design/icons'
import { IStudyFlashcard } from '../../features/study/studyType'

const { Title, Text } = Typography
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8080/uploads/'

interface StudyIntroPageProps {
  flashcard: IStudyFlashcard
  onNext: () => void
}

const StudyIntroPage: React.FC<StudyIntroPageProps> = ({ flashcard, onNext }) => {
  useEffect(() => {
    if (flashcard.audio_url) {
      const audio = new Audio(FILE_URL + flashcard.audio_url)
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
      })
    }
  }, [flashcard.audio_url])

  return (
    <div
      style={{
        margin: '0 auto',
        padding: '24px',
        background: '#2e3b55',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 1000,
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          background: '#3a4760',
          color: 'white',
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        {flashcard.audio_url && (
          <div
            className='speaker-button'
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
            onClick={() => {
              const audio = new Audio(FILE_URL + flashcard.audio_url)
              audio.play()
            }}
          >
            <SoundOutlined
              style={{
                fontSize: '24px',
                color: '#1890ff'
              }}
            />
          </div>
        )}

        <Row gutter={32}>
          <Col xs={24} md={12}>
            {flashcard.image_url ? (
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  background: '#f0f0f0',
                  minWidth: '350px'
                }}
              >
                <img
                  src={FILE_URL + flashcard.image_url}
                  alt='flashcard'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  minHeight: '200px',
                  background: '#4a5670',
                  borderRadius: '8px'
                }}
              >
                <Text style={{ fontSize: '18px', color: '#b0b0b0' }}>No image available</Text>
              </div>
            )}
          </Col>

          <Col xs={24} md={12}>
            <div style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: '18px', color: '#b0b0b0', marginBottom: '8px', display: 'block' }}>
                Thuật ngữ
              </Text>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                {flashcard.front_text}
              </Title>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  padding: '12px 0px',
                  marginBottom: '16px'
                }}
              >
                <TranslationOutlined style={{ fontSize: '20px', color: '#b0b0b0' }} />
                <Title level={5} style={{ margin: 0, color: '#b0b0b0' }}>
                  Định Nghĩa
                </Title>
                <Text style={{ fontSize: '18px', color: 'white', display: 'block' }}>{flashcard.back_text}</Text>
              </div>

              {flashcard.pronunciation && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #4a5670',
                    background: '#4a5670'
                  }}
                >
                  <Space align='center' style={{ marginBottom: '8px' }}>
                    <SoundOutlined style={{ fontSize: '20px', color: '#b0b0b0' }} />
                    <Title level={5} style={{ margin: 0, color: '#b0b0b0' }}>
                      Phiên âm
                    </Title>
                  </Space>
                  <Text style={{ fontSize: '18px', color: 'white', display: 'block' }}>{flashcard.pronunciation}</Text>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button
                type='primary'
                size='large'
                onClick={onNext}
                style={{
                  height: 'auto',
                  padding: '16px 32px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  background: '#1890ff',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(24,144,255,0.3)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Tiếp tục
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default StudyIntroPage
