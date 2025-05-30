import React from 'react'
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
  return (
    <div
      style={{
        margin: '0 auto',
        padding: '24px',
        background: '#f0f2f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 1200,
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          background: 'white',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={0}>
          {/* Left side - Question and Info */}
          <Col xs={24} md={14} style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
              <Title level={3} style={{ margin: 0, color: '#262626', fontSize: '28px' }}>
                {flashcard.front_text}
              </Title>
            </div>

            {/* Meaning and Pronunciation */}
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  padding: '24px',
                  borderRadius: '12px',
                  color: 'white',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(24,144,255,0.2)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Space align='center' style={{ marginBottom: '16px' }}>
                  <TranslationOutlined style={{ fontSize: '24px' }} />
                  <Title level={4} style={{ margin: 0, color: 'white' }}>
                    Nghĩa
                  </Title>
                </Space>
                <Text
                  style={{
                    fontSize: '24px',
                    color: 'white',
                    display: 'block',
                    lineHeight: '1.5',
                    fontWeight: 500
                  }}
                >
                  {flashcard.back_text}
                </Text>
              </div>

              {flashcard.pronunciation && (
                <div
                  style={{
                    background: '#f6ffed',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #b7eb8f',
                    boxShadow: '0 4px 12px rgba(82,196,26,0.1)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Space align='center' style={{ marginBottom: '16px' }}>
                    <SoundOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <Title level={4} style={{ margin: 0, color: '#262626' }}>
                      Phiên âm
                    </Title>
                  </Space>
                  <Text
                    style={{
                      fontSize: '24px',
                      color: '#262626',
                      display: 'block',
                      lineHeight: '1.5',
                      fontWeight: 500
                    }}
                  >
                    {flashcard.pronunciation}
                  </Text>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button
                type='primary'
                size='large'
                onClick={onNext}
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(24,144,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(24,144,255,0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24,144,255,0.3)'
                }}
              >
                Tiếp tục
              </Button>
            </div>
          </Col>

          {/* Right side - Image */}
          <Col
            xs={24}
            md={10}
            style={{
              background: '#f8f9fa',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                background: '#f0f0f0',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {flashcard.image_url ? (
                <img
                  src={FILE_URL + flashcard.image_url}
                  alt='flashcard'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                  }}
                >
                  <SoundOutlined
                    style={{
                      fontSize: '64px',
                      color: '#1890ff',
                      opacity: 0.8
                    }}
                  />
                  <Text
                    style={{
                      fontSize: '16px',
                      color: '#1890ff',
                      fontWeight: 'bold'
                    }}
                  >
                    Click to listen
                  </Text>
                </div>
              )}
              {/* Speaker overlay */}
              {flashcard.audio_url && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
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
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default StudyIntroPage
