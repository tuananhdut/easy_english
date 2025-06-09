import React, { useState, useEffect } from 'react'
import { Typography, Space, List, message, Descriptions, Tag, Spin, Drawer, Card } from 'antd'
import { getFlashcardsByCollection } from '../../features/flashcard/flashcardApi'
import { IFlashcard } from '../../features/flashcard/flashcardType'
import { ICollection } from '../../features/collecion/collectionType'
import { BookOutlined, SoundOutlined } from '@ant-design/icons'
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8080/uploads/'
const { Title, Text } = Typography

interface CollectionDetailDrawerProps {
  collection: ICollection | null // Allow null when closed
  open: boolean
  onClose: () => void
}

const CollectionDetailDrawer: React.FC<CollectionDetailDrawerProps> = ({ collection, open, onClose }) => {
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([])
  const [loadingFlashcards, setLoadingFlashcards] = useState(false)

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!collection?.id) return // Only fetch if collection ID is available

      setLoadingFlashcards(true)
      try {
        const response = await getFlashcardsByCollection(collection.id)
        if (response.status === 'success' && response.data) {
          setFlashcards(response.data)
        } else {
          setFlashcards([])
          message.error('Không thể tải danh sách flashcard')
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error)
        message.error('Có lỗi xảy ra khi tải danh sách flashcard')
        setFlashcards([])
      } finally {
        setLoadingFlashcards(false)
      }
    }

    fetchFlashcards()
  }, [collection?.id]) // Refetch when collection ID changes

  return (
    <Drawer
      title={
        <Space>
          <BookOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết bộ sưu tập
          </Title>
        </Space>
      }
      placement='right'
      width={500} // Adjust width as needed
      open={open}
      onClose={onClose}
      destroyOnClose // Destroy content when closed
    >
      {collection ? (
        <div style={{ padding: '0 16px' }}>
          {/* Add padding inside drawer */}
          <Descriptions bordered column={1} size='small' style={{ marginBottom: 24 }}>
            <Descriptions.Item label={<Text strong>Tên</Text>}>{collection.name}</Descriptions.Item>
            <Descriptions.Item label={<Text strong>Mô tả</Text>}>
              {collection.description || <Text type='secondary'>Không có mô tả</Text>}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Ngày tạo</Text>}>
              {new Date(collection.created_at).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Ngôn ngữ</Text>}>
              <Space>
                <Tag color='blue'>{collection.source_language}</Tag>
                <span>-</span>
                <Tag color='green'>{collection.target_language}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Cấp độ</Text>}>
              <Tag color='purple'>{collection.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Số thẻ</Text>}>{collection.total_flashcards}</Descriptions.Item>
            {/* Add more details if available in ICollection, e.g., progress, review status */}
          </Descriptions>
          <div>
            <Title level={5} style={{ marginBottom: 16, color: '#0077cc' }}>
              Danh sách Flashcard
            </Title>
            {loadingFlashcards ? (
              <div style={{ textAlign: 'center' }}>
                <Spin />
              </div>
            ) : flashcards.length > 0 ? (
              <List
                size='small'
                dataSource={flashcards}
                renderItem={(item) => (
                  <List.Item style={{ padding: 0, borderBottom: 'none' }}>
                    <Card
                      size='small'
                      style={{
                        width: '100%',
                        marginBottom: 8
                      }}
                    >
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <Text strong style={{ color: '#0056b3' }}>
                            {item.term}:
                          </Text>
                          <Text>{item.definition}</Text>
                        </Space>
                        {item.audio_url && (
                          <SoundOutlined
                            style={{ color: '#1890ff', cursor: 'pointer', fontSize: '16px' }}
                            onClick={(e) => {
                              e.stopPropagation() // Prevent card click
                              try {
                                new Audio(FILE_URL + item.audio_url).play()
                              } catch (error) {
                                console.error('Error playing audio:', error)
                                message.error('Không thể phát âm thanh.')
                              }
                            }}
                          />
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              // Only show this if collection is not null and flashcards are empty
              !loadingFlashcards && <Text type='secondary'>Bộ sưu tập này chưa có flashcard nào.</Text>
            )}
          </div>
        </div>
      ) : (
        // Show loading or empty state when collection is null initially
        open && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <Spin tip='Loading collection...' />
          </div>
        )
      )}
    </Drawer>
  )
}

export default CollectionDetailDrawer
