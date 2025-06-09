import React, { useState } from 'react'
import { Card, Typography, Button, Row, Col, Modal, message, notification } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard, IUpdateFlashcardRequest } from '../../features/flashcard/flashcardType'
import FlashcardForm from './FlashcardForm'
import { deleteFlashcard, updateFlashcard } from '../../features/flashcard/flashcardApi'

const { Text } = Typography

interface FormValues {
  term: string
  definition: string
  pronunciation?: string
}

interface FlashcardListProps {
  flashcards: IFlashcard[]
  onFlashcardChange: () => void // Callback để refresh danh sách
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, onFlashcardChange }) => {
  const [api, contextHolder] = notification.useNotification()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setEditingIndex(null)
    setIsModalVisible(false)
  }

  const handleFormSubmit = async (values: FormValues) => {
    if (editingIndex === null) return

    try {
      setLoading(true)
      const flashcard = flashcards[editingIndex]
      if (!flashcard.id) {
        message.error('Không thể chỉnh sửa flashcard chưa được lưu!')
        return
      }

      const updateData: IUpdateFlashcardRequest = {
        term: values.term,
        definition: values.definition,
        pronunciation: values.pronunciation
      }

      const response = await updateFlashcard(flashcard.id, updateData)

      if (response.status === 'success') {
        api.success({
          message: 'Cập nhật flashcard thành công',
          description: 'Flashcard đã được cập nhật trong hệ thống'
        })
        onFlashcardChange()
        handleModalClose()
      } else {
        message.error(response.message || 'Cập nhật flashcard thất bại!')
      }
    } catch (error) {
      console.error('Error updating flashcard:', error)
      message.error('Có lỗi xảy ra khi cập nhật flashcard!')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (index: number) => {
    const flashcard = flashcards[index]
    if (!flashcard.id) {
      message.error('Không thể xóa flashcard chưa được lưu!')
      return
    }

    try {
      setLoading(true)
      const response = await deleteFlashcard(flashcard.id)
      if (response.status === 'success') {
        api.success({
          message: 'Xóa flashcard thành công',
          description: 'Flashcard đã được xóa khỏi hệ thống'
        })
        onFlashcardChange()
      } else {
        message.error(response.message || 'Xóa flashcard thất bại!')
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      message.error('Có lỗi xảy ra khi xóa flashcard!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]}>
        {flashcards.length === 0 && (
          <Col span={24} style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
            Chưa có flashcard nào.
          </Col>
        )}
        {flashcards.map((item, idx) => (
          <Col xs={24} sm={12} md={8} key={idx}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
              styles={{
                body: {
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }
              }}
              cover={
                item.image_url ? (
                  <img
                    alt='img'
                    src={item.image_url}
                    style={{
                      maxHeight: 120,
                      objectFit: 'contain',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      padding: '8px'
                    }}
                  />
                ) : null
              }
              actions={[
                <Button icon={<UploadOutlined />} size='small' onClick={() => handleEdit(idx)} key='edit' type='text'>
                  Sửa
                </Button>,
                <Button danger size='small' onClick={() => handleDelete(idx)} key='delete' type='text'>
                  Xóa
                </Button>
              ]}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text strong style={{ fontSize: 18, marginBottom: 8 }}>
                  {item.term}
                </Text>
                <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{item.definition}</Text>
                {item.audio_url && (
                  <audio
                    controls
                    src={item.audio_url}
                    style={{
                      marginTop: 16,
                      width: '100%',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal title='Chỉnh sửa flashcard' open={isModalVisible} onCancel={handleModalClose} footer={null} width={600}>
        {editingIndex !== null && (
          <FlashcardForm
            initialValues={flashcards[editingIndex]}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
            loading={loading}
          />
        )}
      </Modal>
    </>
  )
}

export default FlashcardList
