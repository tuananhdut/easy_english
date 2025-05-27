import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Radio, Input, Space, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { startStudySession, checkAnswer } from '../features/study/studyApi'
import { IStudySession, IStudyFlashcard } from '../features/study/studyType'

const { Title, Text } = Typography

const StudyPage: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<IStudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [typingAnswer, setTypingAnswer] = useState('')

  useEffect(() => {
    startSession()
  }, [collectionId])

  const startSession = async () => {
    try {
      setLoading(true)
      const response = await startStudySession({ collectionId: collectionId || '' })
      if (response.status === 'success' && response.data) {
        setSession(response.data)
      }
    } catch (err) {
      console.error('Error starting study session:', err)
      message.error('Không thể bắt đầu phiên học')
      navigate('/dashboard/dictionary')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!session) return

    try {
      setLoading(true)
      const response = await checkAnswer(session.id, selectedAnswer || typingAnswer)
      if (response.status === 'success' && response.data) {
        const nextSession: IStudySession = {
          ...response.data.nextPhase,
          userId: session.userId,
          collectionId: session.collectionId
        }
        setSession(nextSession)
        setSelectedAnswer('')
        setTypingAnswer('')
      }
    } catch (err) {
      console.error('Error checking answer:', err)
      message.error('Có lỗi xảy ra khi kiểm tra câu trả lời')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard/dictionary')
  }

  const getCurrentFlashcard = (): IStudyFlashcard | null => {
    if (!session || session.flashcards.length === 0) return null
    return session.flashcards[session.currentIndex]
  }

  const renderIntroMode = (flashcard: IStudyFlashcard) => (
    <Card style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <Title level={3}>{flashcard.front_text}</Title>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 24, display: 'block' }}>{flashcard.back_text}</Text>
      {flashcard.image_url && (
        <img src={flashcard.image_url} alt='flashcard' style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 24 }} />
      )}
      {flashcard.audio_url && <audio controls src={flashcard.audio_url} style={{ marginBottom: 24 }} />}
      <Button type='primary' size='large' onClick={handleNext} loading={loading}>
        Tiếp tục
      </Button>
    </Card>
  )

  const renderQuizMode = (flashcard: IStudyFlashcard) => {
    const options = [
      flashcard.back_text,
      ...(session?.flashcards
        .filter((f) => f.id !== flashcard.id)
        .slice(0, 3)
        .map((f) => f.back_text) || [])
    ].sort(() => Math.random() - 0.5)

    return (
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          {flashcard.front_text}
        </Title>
        <Radio.Group
          value={selectedAnswer}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction='vertical' style={{ width: '100%' }}>
            {options.map((option, index) => (
              <Radio.Button key={index} value={option} style={{ width: '100%', textAlign: 'left', height: 'auto' }}>
                {option}
              </Radio.Button>
            ))}
          </Space>
        </Radio.Group>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type='primary' size='large' onClick={handleNext} loading={loading} disabled={!selectedAnswer}>
            Kiểm tra
          </Button>
        </div>
      </Card>
    )
  }

  const renderTypingMode = (flashcard: IStudyFlashcard) => (
    <Card style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        {flashcard.front_text}
      </Title>
      <Input
        size='large'
        value={typingAnswer}
        onChange={(e) => setTypingAnswer(e.target.value)}
        placeholder='Nhập câu trả lời của bạn'
        style={{ marginBottom: 24 }}
      />
      <div style={{ textAlign: 'center' }}>
        <Button type='primary' size='large' onClick={handleNext} loading={loading} disabled={!typingAnswer}>
          Kiểm tra
        </Button>
      </div>
    </Card>
  )

  const renderContent = () => {
    const flashcard = getCurrentFlashcard()
    if (!flashcard) return null

    if (flashcard.intro) return renderIntroMode(flashcard)
    if (flashcard.quiz) return renderQuizMode(flashcard)
    if (flashcard.typing) return renderTypingMode(flashcard)

    return null
  }

  if (loading && !session) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 16 }}>
          Quay lại
        </Button>
      </div>
      {renderContent()}
    </div>
  )
}

export default StudyPage
