import React, { useState, useEffect } from 'react'
import { Card, Typography, Input, Space, Row, Col, Button } from 'antd'
import { SoundOutlined } from '@ant-design/icons'
import { IStudyFlashcard } from '../../features/study/studyType'

const { Title, Text } = Typography
const CORRECT_SOUND_URL = '/path/to/your/correct/sound.mp3' // **REPLACE WITH YOUR ACTUAL SOUND FILE URL**

interface TestTypingPageProps {
  flashcard: IStudyFlashcard
  onNext: (value: string) => void
}

const StudyTypingPage: React.FC<TestTypingPageProps> = ({ flashcard, onNext }) => {
  const [typingAnswer, setTypingAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    // Auto play audio when flashcard data is available
    if (flashcard.audio_url) {
      const audio = new Audio(flashcard.audio_url)
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
        // Handle potential errors like user gesture requirements for autoplay
      })
    }
  }, [flashcard.audio_url]) // Re-run effect if audio_url changes

  const handleCheckAnswer = () => {
    if (!typingAnswer) return

    const isAnswerCorrect = typingAnswer.toLowerCase().trim() === flashcard.term.toLowerCase().trim()
    setIsCorrect(isAnswerCorrect)
    setShowResult(true)

    setTimeout(() => {
      if (isAnswerCorrect && CORRECT_SOUND_URL) {
        const audio = new Audio(CORRECT_SOUND_URL)
        audio.play().catch((error) => {
          console.error('Error playing correct sound:', error)
        })
      }
      // Delay navigation slightly if sound is playing, or adjust the timeout if needed
      setTimeout(
        () => {
          setTypingAnswer('')
          setShowResult(false)
          onNext(typingAnswer)
        },
        isAnswerCorrect && CORRECT_SOUND_URL ? 500 : 0
      ) // Add a small delay if sound is expected to play
    }, 1000) // 1 second delay to show the result before attempting sound/next
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
        background: '#2e3b55', // Dark blue background
        display: 'flex',
        flexDirection: 'column', // Stack children vertically
        alignItems: 'center',
        justifyContent: 'flex-start' // Align items to top
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 1100, // Match maxWidth of QuizPage card
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Match boxShadow of QuizPage card
          background: '#3a4760', // Match background of QuizPage card
          color: 'white', // White text for card content
          overflow: 'hidden',
          position: 'relative' // Needed for absolute positioning of speaker icon
        }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* Speaker overlay - positioned absolutely within the card */}
        {flashcard.audio_url && (
          <div
            className='speaker-button'
            style={{
              margin: '24px',
              position: 'absolute',
              top: '16px', // Position from top
              right: '16px', // Position from right
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10 // Ensure it's above other content
            }}
            onClick={() => {
              const audio = new Audio(flashcard.audio_url)
              audio.play()
            }}
          >
            <SoundOutlined
              style={{
                fontSize: '24px', // Match icon size
                color: '#1890ff'
              }}
            />
          </div>
        )}

        <Row gutter={32}>
          {' '}
          {/* Use Row and Col for layout */}
          {/* Left Col: Image */}
          <Col xs={24} md={12}>
            {' '}
            {/* Adjust column width */}
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
                  minHeight: '200px', // Ensure a minimum height for the image container
                  background: '#f0f0f0', // Fallback background
                  minWidth: '350px' // Set minimum width
                }}
              >
                <img
                  src={flashcard.image_url}
                  alt='flashcard'
                  style={{
                    maxWidth: '100%', // Ensure image fits container
                    maxHeight: '300px', // Limit image height
                    objectFit: 'contain' // Use contain to show full image
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
                  minHeight: '200px', // Ensure a minimum height for the container
                  background: '#4a5670', // Match background of other sections
                  borderRadius: '8px'
                }}
              >
                <Text style={{ fontSize: '18px', color: '#b0b0b0' }}>No image available</Text>
              </div>
            )}
          </Col>
          {/* Right Col: Question and Input */}
          <Col xs={24} md={12}>
            {' '}
            {/* Adjust column width */}
            <div style={{ marginBottom: '32px' }}>
              <Text style={{ fontSize: '18px', color: '#b0b0b0', marginBottom: '8px', display: 'block' }}>
                Định nghĩa
              </Text>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                {flashcard.definition} {/* Use definition for the definition/question */}
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
                  border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`,
                  color: isCorrect ? '#52c41a' : '#ff4d4f' // Match text color
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: 'inherit', // Inherit color from parent div
                    fontWeight: 'bold'
                  }}
                >
                  {isCorrect ? 'Chính xác!' : `Sai rồi. Đáp án đúng là: ${flashcard.term}`}{' '}
                  {/* Use term for the correct answer */}
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
                    borderRadius: '8px',
                    background: '#4a5670', // Match background of other sections
                    border: '1px solid #4a5670', // Subtle border
                    color: 'white'
                  }}
                />
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#b0b0b0', // Match text color
                    textAlign: 'center'
                  }}
                >
                  Nhấn Enter để kiểm tra
                </Text>
              </Space>
            )}
          </Col>
        </Row>
        {/* Check button - positioned absolutely at bottom right */}
        {!showResult && (
          <div
            style={{
              position: 'absolute',
              bottom: '32px', // Position from the bottom of the card
              right: '32px', // Position from the right of the card
              zIndex: 10 // Ensure it's above other content
            }}
          >
            <Button
              type='primary'
              size='large'
              onClick={handleCheckAnswer}
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
              Kiểm tra
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default StudyTypingPage
