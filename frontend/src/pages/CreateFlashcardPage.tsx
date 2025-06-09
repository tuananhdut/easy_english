import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Row, Col, message, notification, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { createFlashcard, getFlashcardsByCollection } from '../features/flashcard/flashcardApi'
import { ICreateFlashcardRequest, IFlashcard } from '../features/flashcard/flashcardType'
import FlashcardList from '../components/flashcard/FlashcardList'
import FlashcardForm from '../components/flashcard/FlashcardForm'

const { Title } = Typography
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8080/uploads/'

interface FlashcardFormValues {
  term: string
  definition: string
  pronunciation?: string
}

const CreateFlashcardPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const { id: collectionId } = useParams<{ id: string }>()
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchFlashcards = async () => {
    try {
      const response = await getFlashcardsByCollection(parseInt(collectionId || '0'))
      if (response.data) {
        const flashcardsWithUrls = response.data.map((flashcard) => ({
          ...flashcard,
          image_url: flashcard.image_url ? `${FILE_URL}${flashcard.image_url}` : undefined,
          audio_url: flashcard.audio_url ? `${FILE_URL}${flashcard.audio_url}` : undefined
        }))
        setFlashcards(flashcardsWithUrls)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      message.error('Có lỗi xảy ra khi tải danh sách flashcard!')
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [collectionId])

  const handleAdd = async (values: FlashcardFormValues, imageFile: File | null, audioFile: File | null) => {
    try {
      setLoading(true)
      const flashcardData: ICreateFlashcardRequest = {
        collection_id: parseInt(collectionId || '0'),
        term: values.term,
        definition: values.definition,
        image: imageFile || undefined,
        audio: audioFile || undefined
      }

      const response = await createFlashcard(flashcardData)

      if (response.status === 'success') {
        message.success('Thêm flashcard thành công!')
        fetchFlashcards()
        api.success({
          message: 'Thêm flashcard thành công',
          description: 'Flashcard đã được thêm vào hệ thống'
        })
      }
    } catch (error) {
      console.error('Error adding flashcard:', error)
      api.error({
        message: 'Thêm flashcard thất bại',
        description: 'Có lỗi xảy ra khi thêm flashcard'
      })
      throw error // Re-throw để FlashcardForm có thể xử lý
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard/dictionary')
  }

  return (
    <div style={{ background: '#f0f2f5' }}>
      {contextHolder}
      <div
        style={{
          padding: '24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Button
              type='text'
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{
                marginRight: 16,
                color: '#1890ff',
                fontSize: '16px'
              }}
            />
            <Title level={3} style={{ flex: 1, margin: 0 }}>
              Thêm Flashcard cho bộ từ điển
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Title level={4} style={{ marginBottom: 24 }}>
                Thêm Flashcard Mới
              </Title>
              <FlashcardForm onSubmit={handleAdd} onCancel={() => {}} loading={loading} />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Title level={4} style={{ marginBottom: 24 }}>
                Danh sách flashcard đã thêm
              </Title>
              <FlashcardList flashcards={flashcards} onFlashcardChange={fetchFlashcards} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CreateFlashcardPage
