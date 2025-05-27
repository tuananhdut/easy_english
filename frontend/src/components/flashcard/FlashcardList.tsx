import React, { useState } from 'react'
import { Card, Typography, Button, Row, Col, Modal } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'
import FlashcardForm from './FlashcardForm'

const { Text } = Typography

interface FlashcardListProps {
  flashcards: IFlashcard[]
  onEdit: (index: number, values: Partial<IFlashcard>) => void
  onDelete: (index: number) => void
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, onEdit, onDelete }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsModalVisible(true)
  }
  //test
  const handleModalClose = () => {
    setEditingIndex(null)
    setIsModalVisible(false)
  }

  const handleFormSubmit = (values: Partial<IFlashcard>) => {
    if (editingIndex !== null) {
      onEdit(editingIndex, values)
      handleModalClose()
    }
  }

  return (
    <>
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
                <Button danger size='small' onClick={() => onDelete(idx)} key='delete' type='text'>
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
                  {item.front_text}
                </Text>
                <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{item.back_text}</Text>
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
          />
        )}
      </Modal>
    </>
  )
}

export default FlashcardList
