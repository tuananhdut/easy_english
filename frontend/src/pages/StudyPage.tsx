import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { startStudySession, checkAnswer } from '../features/study/studyApi'
import { IStudySession, IStudyFlashcard } from '../features/study/studyType'
import StudyIntroPage from '../components/study/StudyIntroPage'
import StudyQuizPage from '../components/study/StudyQuizPage'
import TestTypingPage from '../components/study/StudyTypingPage'

const StudyPage: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<IStudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('introduction')
  const [collectionid, setCollectionid] = useState(0)

  useEffect(() => {
    startSession()
  }, [collectionId])

  const startSession = async () => {
    try {
      setLoading(true)
      const response = await startStudySession({ collectionId: collectionId || '' })
      if (response.status === 'success' && response.data) {
        setSession(response.data)
        setStatus(response.data.status)
        setCurrentIndex(response.data.currentIndex)
        setCollectionid(response.data.collectionId)
      }
    } catch (err) {
      console.error('Error starting study session:', err)
      message.error('Không thể bắt đầu phiên học')
      navigate('/dashboard/dictionary')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async (value: string = '') => {
    if (!session) return

    try {
      setLoading(true)
      if (status === 'introduction') {
        const response = await checkAnswer(session.id, session.flashcards[currentIndex].front_text)
        if (response.status === 'success' && response.data) {
          setSession(response.data.nextPhase)
          setStatus(response.data.nextPhase.status)
          setCurrentIndex(response.data.nextPhase.currentIndex)
        }
      }
      if (status === 'quiz') {
        const response = await checkAnswer(session.id, value)
        if (response.status === 'success' && response.data) {
          setSession(response.data.nextPhase)
          setStatus(response.data.nextPhase.status)
          setCurrentIndex(response.data.nextPhase.currentIndex)
        }
      }
      if (status === 'typing') {
        const response = await checkAnswer(session.id, value)
        if (response.status === 'success' && response.data) {
          setSession(response.data.nextPhase)
          setStatus(response.data.nextPhase.status)
          setCurrentIndex(response.data.nextPhase.currentIndex)
        }
      }
    } catch (err) {
      console.error('Error checking answer:', err)
      message.error('Có lỗi xảy ra khi kiểm tra câu trả lời')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentFlashcard = (): IStudyFlashcard | null => {
    if (!session || session.flashcards.length === 0) return null
    return session.flashcards[session.currentIndex]
  }

  const renderIntroMode = (flashcard: IStudyFlashcard) => <StudyIntroPage flashcard={flashcard} onNext={handleNext} />

  const renderQuizMode = (flashcard: IStudyFlashcard, collection_id: number) => (
    <StudyQuizPage flashcard={flashcard} collectionId={collection_id} onNext={handleNext} />
  )
  const rendercompleted = () => (
    <>
      <h1>bạn đã hoàn thành bài kiểm tra </h1>
    </>
  )

  const renderTypingMode = (flashcard: IStudyFlashcard) => <TestTypingPage flashcard={flashcard} onNext={handleNext} />

  const renderContent = () => {
    const flashcard = getCurrentFlashcard()
    if (!flashcard) return null
    if (status === 'quiz') return renderQuizMode(flashcard, collectionid)
    if (status === 'introduction') return renderIntroMode(flashcard)
    if (status === 'typing') return renderTypingMode(flashcard)
    if (status === 'completed') return rendercompleted()

    return null
  }

  if (loading && !session) {
    return <div>Loading...</div>
  }

  return <>{renderContent()}</>
}

export default StudyPage
