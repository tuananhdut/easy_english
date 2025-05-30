import React, { useState } from 'react'
import { Card, Typography, Input, Space, Row, Col } from 'antd'
import { SoundOutlined } from '@ant-design/icons'
import { IStudyFlashcard } from '../../features/study/studyType'

const { Title, Text } = Typography
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8080/uploads/'

interface TestTypingPageProps {
  flashcard: IStudyFlashcard
  onNext: (value: string) => void
}

const StudyTypingPage: React.FC<TestTypingPageProps> = ({ flashcard, onNext }) => {
  const [typingAnswer, setTypingAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleCheckAnswer = () => {
    if (!typingAnswer) return

    const isAnswerCorrect = typingAnswer.toLowerCase().trim() === flashcard.back_text.toLowerCase().trim()
    setIsCorrect(isAnswerCorrect)
    setShowResult(true)

    // Auto move to next question after a short delay
    setTimeout(() => {
      setTypingAnswer('')
      setShowResult(false)
      onNext(typingAnswer)
    }, 1500) // 1.5 seconds delay to show the result
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheckAnswer()
    }
  }

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
          background: 'white'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={0}>
          {/* Left side - Question and Input */}
          <Col xs={24} md={14} style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ margin: 0, color: '#262626' }}>
                {flashcard.front_text}
              </Title>
            </div>

            {showResult ? (
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 24,
                  padding: '16px',
                  borderRadius: '8px',
                  background: isCorrect ? '#f6ffed' : '#fff2f0',
                  border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: isCorrect ? '#52c41a' : '#ff4d4f',
                    fontWeight: 'bold'
                  }}
                >
                  {isCorrect ? 'Chính xác!' : `Sai rồi. Đáp án đúng là: ${flashcard.back_text}`}
                </Text>
              </div>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <Input
                  size='large'
                  value={typingAnswer}
                  onChange={(e) => setTypingAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Nhập câu trả lời của bạn'
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '8px'
                  }}
                />
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#8c8c8c',
                    textAlign: 'center'
                  }}
                >
                  Nhấn Enter để kiểm tra
                </Text>
              </Space>
            )}
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
                background: '#f0f0f0'
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

export default StudyTypingPage
