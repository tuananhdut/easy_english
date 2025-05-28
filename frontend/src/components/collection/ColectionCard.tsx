import React from 'react'
import { Card, Space, Tag, Typography, Progress, Avatar, Button } from 'antd'
import {
  GlobalOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ICollection } from '../../features/collecion/collectionType'
const { Text } = Typography

export interface CollectionCardProps {
  collection: ICollection
  type: 'owned' | 'sharedView' | 'sharedEdit'
  onEdit?: (collectionId: number) => void
  onStudy?: (collectionId: number) => void
  onReview?: (collectionId: number) => void
  onCardClick?: () => void
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  type,
  onEdit,
  onStudy,
  onReview,
  onCardClick
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigate = useNavigate()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(collection.id)
    } else {
      navigate(`/dashboard/edit-collection/${collection.id}`)
    }
  }

  const handleStudy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStudy) {
      onStudy(collection.id)
    }
  }

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReview) {
      onReview(collection.id)
    }
  }

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick()
    }
  }

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        height: '100%',
        ...(window.innerWidth >= 768 && {
          minWidth: 500,
          maxWidth: 500
        })
      }}
    >
      <Card.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={collection.name}
        description={
          <Space direction='vertical' style={{ width: '100%' }}>
            <Text>{collection.description}</Text>

            {/* Progress Section */}
            <div style={{ marginTop: 16 }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text strong>Tiến độ học tập</Text>
                </Space>
                <Progress percent={(collection.learnedWords / collection.total_flashcards) * 100} status='active' />
              </Space>
            </div>

            {/* Word Count Section */}
            <Space wrap style={{ marginTop: 16 }}>
              <Tag color='blue'>
                <BookOutlined /> Tổng số từ: {collection.total_flashcards}
              </Tag>
              <Tag color='green'>
                <CheckCircleOutlined /> Đã học: {collection.learnedWords}
              </Tag>
              <Tag color='orange'>
                <ClockCircleOutlined /> Cần ôn tập: {collection.reviewWords}
              </Tag>
            </Space>

            {/* Other Tags */}
            <Space wrap style={{ marginTop: 8 }}>
              <Tag color='purple'>
                <GlobalOutlined /> {collection.level}
              </Tag>
            </Space>

            {/* Last Update */}
            <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
              <ClockCircleOutlined /> Cập nhật: {formatDate(collection.updated_at)}
            </Text>
          </Space>
        }
      />
      <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', gap: 8, justifyContent: 'center' }}>
        {type !== 'sharedView' && (
          <Button icon={<EditOutlined />} onClick={handleEdit} type='primary'>
            Chỉnh sửa
          </Button>
        )}
        <Button type='primary' onClick={handleStudy}>
          Học
        </Button>
        <Button icon={<ClockCircleOutlined />} onClick={handleReview}>
          Ôn tập
        </Button>
      </div>
    </Card>
  )
}

export default CollectionCard
