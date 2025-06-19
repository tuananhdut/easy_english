import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message, Layout, Row, Col, Card, Typography, Space, Avatar, List, Spin, Button } from 'antd'
import { TrophyOutlined, LeftOutlined } from '@ant-design/icons'
import { startStudySession, checkAnswer, getPaginatedScores } from '../features/study/studyApi'
import { IStudySession, IStudyFlashcard } from '../features/study/studyType'
import StudyIntroPage from '../components/study/StudyIntroPage'
import StudyQuizPage from '../components/study/StudyQuizPage'
import TestTypingPage from '../components/study/StudyTypingPage'
import StudyCompletePage from '../components/study/StudyCompletePage'

const { Title, Text } = Typography

const StudyPage: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<IStudySession | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('introduction')
  const [collectionid, setCollectionid] = useState(0)
  const [leaderboardData, setLeaderboardData] = useState<
    Array<{ userId: number; fullname: string; score: number; rank: number }>
  >([])
  const [currentUserRank, setCurrentUserRank] = useState<number | undefined>()

  useEffect(() => {
    startSession()
  }, [collectionId])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await getPaginatedScores(collectionid)
        if (response.status === 'success' && response.data) {
          setLeaderboardData(response.data.scores)
          setCurrentUserRank(response.data.currentUserRank)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      }
    }
    if (collectionid) {
      fetchLeaderboard()
    }
  }, [collectionid])

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
    if (!session || !collectionId) return

    try {
      setLoading(true)
      if (status === 'introduction') {
        const response = await checkAnswer(Number(collectionId), session.flashcards[currentIndex].term)
        if (response.status === 'success' && response.data) {
          setSession(response.data.nextPhase)
          setStatus(response.data.nextPhase.status)
          setCurrentIndex(response.data.nextPhase.currentIndex)
        }
      }
      if (status === 'quiz') {
        const response = await checkAnswer(Number(collectionId), value)
        if (response.status === 'success' && response.data) {
          setSession(response.data.nextPhase)
          setStatus(response.data.nextPhase.status)
          setCurrentIndex(response.data.nextPhase.currentIndex)
        }
      }
      if (status === 'typing') {
        const response = await checkAnswer(Number(collectionId), value)
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
  const rendercompleted = () => {
    if (session?.score != null) {
      return <StudyCompletePage score={session?.score} />
    }
  }

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
    return (
      <Layout style={{ minHeight: '100vh', background: '#2e3b55' }}>
        <Row justify='center' align='middle' style={{ minHeight: '100vh' }}>
          <Spin size='large' tip='Đang tải phiên học...'></Spin>
        </Row>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#2e3b55' }}>
      <div
        style={{
          height: '64px',
          background: '#3a4760',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 100
        }}
      >
        <Button
          type='text'
          icon={<LeftOutlined style={{ fontSize: '20px', color: 'white' }} />}
          onClick={() => navigate(-1)}
          style={{ color: 'white', paddingLeft: 0 }}
        >
          Thoát
        </Button>
      </div>

      <div style={{ padding: '24px 24px 24px 24px', width: '100%', margin: '0 auto' }}>
        <Row gutter={24}>
          <Col xs={24} md={18}>
            {renderContent()}
          </Col>

          <Col xs={24} md={6}>
            <Card
              title={
                <Space align='center'>
                  <TrophyOutlined style={{ fontSize: '20px' }} />
                  <Title level={4} style={{ margin: 0 }}>
                    BẢNG XẾP HẠNG
                  </Title>
                </Space>
              }
              style={{
                background: '#3a4760',
                color: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              headStyle={{ borderBottom: '1px solid #4a5670', color: 'white' }}
              bodyStyle={{ padding: '12px' }}
            >
              <List
                itemLayout='horizontal'
                dataSource={leaderboardData}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      borderBottom: index === leaderboardData.length - 1 ? 'none' : '1px solid #4a5670',
                      padding: '10px 0'
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: '#1890ff' }}>{item.rank}</Avatar>}
                      title={<Text style={{ color: 'white', fontWeight: 'bold' }}>{item.fullname}</Text>}
                      description={<Text style={{ color: '#b0b0b0' }}>{item.score} điểm</Text>}
                    />
                  </List.Item>
                )}
              />
              {currentUserRank && !leaderboardData.some((item) => item.rank === currentUserRank) && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #4a5670' }}>
                  <Text style={{ color: '#b0b0b0' }}>Vị trí của bạn: {currentUserRank}</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  )
}

export default StudyPage
