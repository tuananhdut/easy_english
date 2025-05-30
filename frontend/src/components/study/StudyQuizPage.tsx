import React, { useState, useEffect } from 'react'
import { Card, Typography, Radio, Space, Row, Col } from 'antd'
import { SoundOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'
import '../../styles/TestQuizPage.css'
import { IStudyFlashcard } from '../../features/study/studyType'
import { getRandomFlashcards } from '../../features/flashcard/flashcardApi'

const { Title, Text } = Typography
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8080/uploads/'

interface StudyQuizPagePropt {
  flashcard: IStudyFlashcard
  collectionId: number
  onNext: (value: string) => void
}

const StudyQuizPage: React.FC<StudyQuizPagePropt> = ({ flashcard, collectionId, onNext }) => {
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    fetchFlashcards()
  }, [flashcard, collectionId]) // Add dependencies

  // lấy
  const fetchFlashcards = async () => {
    try {
      const response = await getRandomFlashcards(collectionId, flashcard.id)
      if (response.status === 'success' && response.data) {
        const newFlashcards = response.data
        setFlashcards(newFlashcards)

        if (newFlashcards.length > 0) {
          for (let i = 0; i < newFlashcards.length; i++) {
            if (newFlashcards[i].id === flashcard.id) {
              setCurrentIndex(i)
              generateOptions(newFlashcards[i], newFlashcards)
              break
            }
          }
        }
      }
    } catch (err) {
      console.error('Error getting random flashcards:', err)
    }
  }

  const generateOptions = (currentFlashcard: IFlashcard, allFlashcards: IFlashcard[]) => {
    // Get 3 random flashcards excluding the current one
    const otherFlashcards = allFlashcards.filter((f) => f.id !== currentFlashcard.id)
    const randomOptions = otherFlashcards.map((f) => f.front_text)

    // Add the correct answer and shuffle
    const allOptions = [...randomOptions, currentFlashcard.front_text]
    setOptions(allOptions.sort(() => Math.random() - 0.5))
  }

  const handleOptionSelect = (selectedValue: string) => {
    setSelectedAnswer(selectedValue)
    const currentFlashcard = flashcards[currentIndex]
    const isAnswerCorrect = selectedValue === currentFlashcard.front_text

    setIsCorrect(isAnswerCorrect)
    setCorrectAnswer(currentFlashcard.front_text)
    setShowResult(true)

    // Auto move to next question after a short delay
    setTimeout(() => {
      setSelectedAnswer('')
      setShowResult(false)
      setCorrectAnswer('')
      onNext(selectedValue)
    }, 1500) // 1.5 seconds delay to show the result
  }

  const renderQuizMode = () => {
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
            {/* Left side - Question and Options */}
            <Col xs={24} md={14} style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0, color: '#262626' }}>
                  {flashcard.back_text}
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
                    {isCorrect ? 'Chính xác!' : `Sai rồi. Đáp án đúng là: ${correctAnswer}`}
                  </Text>
                </div>
              ) : (
                <Radio.Group
                  value={selectedAnswer}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction='vertical' style={{ width: '100%' }}>
                    {options.map((option, index) => (
                      <Radio.Button
                        key={index}
                        value={option}
                        className={`quiz-option ${selectedAnswer === option ? 'selected' : ''} ${
                          showResult && option === correctAnswer ? 'correct' : ''
                        } ${showResult && selectedAnswer === option && option !== correctAnswer ? 'incorrect' : ''}`}
                      >
                        {option}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
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
                <div
                  className='speaker-button'
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
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <SoundOutlined
                    style={{
                      fontSize: '24px',
                      color: '#1890ff'
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return <div>Loading...</div>
  }

  return renderQuizMode()
}

export default StudyQuizPage
