import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Space, Popconfirm, Row, Col } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons'
import DictionaryForm from '../components/collection/CollectionForm'

const { Title, Text } = Typography

// Mock dữ liệu bộ sưu tập
const mockCollection = {
  name: 'Từ vựng tiếng Anh cơ bản',
  description: 'Bộ sưu tập từ vựng tiếng Anh cơ bản cho bắt đầu',
  is_private: true,
  source_language: 'vi',
  target_language: 'en',
  level: 'easy'
}

// Mock dữ liệu flashcard
const initialFlashcards = [
  {
    term: 'apple',
    meaning: 'quả táo',
    image_url: 'https://cdn-icons-png.flaticon.com/128/415/415733.png',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    term: 'banana',
    meaning: 'quả chuối',
    image_url: 'https://cdn-icons-png.flaticon.com/128/415/415734.png',
    audio_url: ''
  },
  {
    term: 'cat',
    meaning: 'con mèo',
    image_url: 'https://cdn-icons-png.flaticon.com/128/616/616408.png',
    audio_url: ''
  },
  {
    term: 'dog',
    meaning: 'con chó',
    image_url: 'https://cdn-icons-png.flaticon.com/128/616/616408.png',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  }
]

const EditCollectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [flashcards, setFlashcards] = useState(initialFlashcards)
  const [search, setSearch] = useState('')

  // Mock collection metadata
  const collectionMetadata = {
    createdAt: '2024-03-15T00:00:00Z',
    totalUsers: 156,
    creator: {
      name: 'Nguyễn Văn A',
      avatar: 'https://example.com/avatar.jpg'
    }
  }

  useEffect(() => {
    // TODO: Gọi API lấy dữ liệu collection theo id
    if (id) {
      // Mock data for now, will be replaced with actual API call
      form.setFieldsValue(mockCollection)
      console.log('Fetching collection with ID:', id)
    }
  }, [form, id])

  const handleFinish = () => {
    message.success('Cập nhật bộ sưu tập thành công!')
    navigate('/dashboard/dictionary')
  }

  const handleCancel = () => {
    navigate('/dashboard/dictionary')
  }

  const handleShare = () => {
    message.info('Chức năng chia sẻ đang được phát triển')
  }

  const handleDelete = (idx: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== idx))
    message.success('Đã xóa flashcard!')
  }

  const handleEditFlashcard = (idx: number) => {
    const fc = flashcards[idx]
    form.setFieldsValue({ name: fc.term, description: fc.meaning })
    message.info('Đã điền dữ liệu flashcard lên form (mock)')
  }

  return (
    <>
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
              onClick={handleCancel}
              style={{
                marginRight: 16,
                color: '#1890ff',
                fontSize: '16px'
              }}
            />
            <Title level={3} style={{ flex: 1, margin: 0 }}>
              Chỉnh sửa bộ sưu tập
            </Title>
            <Button
              type='primary'
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              style={{
                background: '#1890ff',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              Chia sẻ
            </Button>
          </div>

          <div
            style={{
              marginBottom: 24,
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              fontSize: 16
            }}
          >
            <span style={{ fontWeight: 500, color: '#555' }}>
              Ngày tạo{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>
                {new Date(collectionMetadata.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Số người sử dụng{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>
                {collectionMetadata.totalUsers} người
              </span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Người tạo{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{collectionMetadata.creator.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '32px auto',
          padding: '0 24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 300px)',
          borderRadius: '12px'
        }}
      >
        <Space direction='vertical' size={32} style={{ width: '100%', padding: '24px 0' }}>
          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <DictionaryForm mode='edit' initialData={mockCollection} onSubmit={handleFinish} onCancel={handleCancel} />
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, flex: 1 }}>
                Danh sách flashcard
              </Title>
              <Input.Search
                placeholder='Tìm kiếm từ hoặc nghĩa...'
                allowClear
                style={{ width: 260, marginLeft: 16 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size='large'
              />
            </div>
            <Row gutter={[16, 16]}>
              {flashcards.filter(
                (item) =>
                  item.term.toLowerCase().includes(search.toLowerCase()) ||
                  item.meaning.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <Col span={24} style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
                  Chưa có flashcard nào.
                </Col>
              )}
              {flashcards
                .filter(
                  (item) =>
                    item.term.toLowerCase().includes(search.toLowerCase()) ||
                    item.meaning.toLowerCase().includes(search.toLowerCase())
                )
                .map((item, idx) => (
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
                      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}
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
                        <Button
                          icon={<EditOutlined />}
                          size='small'
                          onClick={() => handleEditFlashcard(idx)}
                          key='edit'
                          type='text'
                        >
                          Sửa
                        </Button>,
                        <Popconfirm
                          title='Xóa flashcard này?'
                          onConfirm={() => handleDelete(idx)}
                          okText='Xóa'
                          cancelText='Hủy'
                        >
                          <Button icon={<DeleteOutlined />} size='small' danger key='delete' type='text'>
                            Xóa
                          </Button>
                        </Popconfirm>
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
                        <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{item.meaning}</Text>
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
          </Card>
        </Space>
      </div>
    </>
  )
}

export default EditCollectionPage
