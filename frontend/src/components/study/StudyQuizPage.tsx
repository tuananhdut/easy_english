import React, { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Button } from 'antd'
import { SoundOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'
import '../../styles/TestQuizPage.css'
import { IStudyFlashcard } from '../../features/study/studyType'
import { getRandomFlashcards } from '../../features/flashcard/flashcardApi'

const { Title, Text } = Typography

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
  console.log('check 0- quiz', flashcard)
  useEffect(() => {
    fetchFlashcards()
  }, [flashcard, collectionId]) // Add dependencies

  useEffect(() => {
    if (flashcards.length > 0 && flashcard.audio_url) {
      const audio = new Audio(flashcard.audio_url)
      audio.play().catch((error) => {
        console.error('Error playing audio on Quiz Page:', error)
        // Handle potential errors like user gesture requirements for autoplay
      })
    }
  }, [flashcard])

  const fetchFlashcards = async () => {
    try {
      const response = await getRandomFlashcards(collectionId, flashcard.id)
      if (response.status === 'success' && response.data) {
        const newFlashcards = response.data
        setFlashcards(newFlashcards)

        if (newFlashcards.length > 0) {
          const currentFlashcardIndex = newFlashcards.findIndex((f) => f.id === flashcard.id)
          if (currentFlashcardIndex !== -1) {
            setCurrentIndex(currentFlashcardIndex)
          }

          const optionsList = newFlashcards.map((f) => f.term)
          setOptions(optionsList)
        }
      }
    } catch (err) {
      console.error('Error getting random flashcards:', err)
    }
  }

  const handleOptionSelect = (selectedValue: string) => {
    setSelectedAnswer(selectedValue)
    const currentFlashcard = flashcard
    const isAnswerCorrect = selectedValue === currentFlashcard.term

    setIsCorrect(isAnswerCorrect)
    setCorrectAnswer(currentFlashcard.term)
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
    const currentFlashcard = flashcards[currentIndex]
    if (!currentFlashcard) return null // Handle case where flashcard is not loaded yet

    return (
      <div
        style={{
          margin: '0 auto',
          background: '#2e3b55', // Dark blue background from image
          display: 'flex',
          flexDirection: 'column', // Stack children vertically
          alignItems: 'center',
          justifyContent: flashcards.length > 0 ? 'flex-start' : 'center' // Align items to top if flashcards are loaded
        }}
      >
        {flashcards.length > 0 && (
          <Card
            style={{
              width: '100%',
              maxWidth: 1000, // Adjusted max-width for the content area
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Darker shadow
              background: '#3a4760', // Slightly lighter blue for card background
              color: 'white',
              position: 'relative' // Add relative positioning to the card
            }}
            bodyStyle={{ padding: '32px' }}
          >
            {/* Speaker overlay - positioned absolutely within the card */}
            <div
              className='speaker-button'
              style={{
                position: 'absolute',
                top: '16px', // Position from top
                right: '16px', // Position from right
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: '40px', // Slightly smaller size
                height: '40px', // Slightly smaller size
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1 // Ensure it's above other content
              }}
            >
              <SoundOutlined
                style={{
                  fontSize: '24px', // Make icon larger
                  color: '#1890ff'
                }}
              />
            </div>

            <Row gutter={32}>
              {' '}
              {/* Use Row and Col for layout */}
              {/* Left Col: Image */}
              <Col xs={24} md={12}>
                {' '}
                {/* Adjust column width */}
                {currentFlashcard.image_url && (
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
                      background: '#f0f0f0',
                      minWidth: '350px' // Set minimum width to be more than 1.5 * minHeight
                    }}
                  >
                    <img
                      src={currentFlashcard.image_url}
                      alt='flashcard'
                      style={{
                        maxWidth: '100%', // Ensure image fits container
                        maxHeight: '300px', // Limit image height
                        objectFit: 'contain' // Use contain to show full image
                      }}
                    />
                  </div>
                )}
              </Col>
              {/* Right Col: Definition and Options */}
              <Col xs={24} md={12}>
                {' '}
                {/* Adjust column width */}
                <div style={{ marginBottom: '32px' }}>
                  <Text style={{ fontSize: '18px', color: '#b0b0b0', marginBottom: '8px', display: 'block' }}>
                    Định nghĩa
                  </Text>
                  <Title level={2} style={{ margin: 0, color: 'white' }}>
                    {currentFlashcard.definition} {/* Use definition for the definition */}
                  </Title>
                </div>
                <div>
                  <Text style={{ fontSize: '18px', color: '#b0b0b0', marginBottom: '16px', display: 'block' }}>
                    Chọn thuật ngữ đúng
                  </Text>

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
                    <div className='quiz-options-grid'>
                      {' '}
                      {/* Use a div for the grid layout */}
                      {options.map((option, index) => (
                        <Button
                          type='primary'
                          key={index}
                          className={`quiz-option-button ${selectedAnswer === option ? 'selected' : ''}`}
                          onClick={() => handleOptionSelect(option)}
                          style={{
                            width: '100%',
                            padding: '16px', // Add padding
                            textAlign: 'left', // Align text to the left
                            whiteSpace: 'normal', // Allow text wrapping
                            height: 'auto', // Adjust height based on content
                            marginBottom: '8px' // Add space between buttons
                          }}
                        >
                          <span style={{ marginRight: '8px', fontWeight: 'bold' }}>{index + 1}</span>
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* "Bạn không biết?" link */}
                  {!showResult && (
                    <div style={{ textAlign: 'right', marginTop: '16px' }}>
                      <Button type='link' style={{ color: '#b0b0b0' }}>
                        Bạn không biết?
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    )
  }

  if (flashcards.length === 0) {
    return <div>Loading...</div>
  }

  return renderQuizMode()
}

export default StudyQuizPage
