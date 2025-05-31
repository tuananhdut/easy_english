import React, { useState } from 'react'
import { Card, Space, Tag, Typography, Progress, Avatar, Button, Tooltip, Modal, Input, List, Switch } from 'antd'
import {
  GlobalOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ShareAltOutlined,
  LinkOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ICollection } from '../../features/collecion/collectionType'
const { Text, Title } = Typography

export interface CollectionCardProps {
  collection: ICollection
  type: 'owned' | 'sharedView' | 'sharedEdit'
  onEdit?: (collectionId: number) => void
  onStudy?: (collectionId: number) => void
  onReview?: (collectionId: number) => void
  onCardClick?: () => void
  onAddFlashcard?: (collectionId: number) => void
}

interface ISharedUser {
  id: number
  email: string
  name: string
  canEdit: boolean
  status: 'pending' | 'accepted' | 'rejected'
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  type,
  onEdit,
  onStudy,
  onReview,
  onCardClick,
  onAddFlashcard
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigate = useNavigate()

  const [isShareModalVisible, setIsShareModalVisible] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharedUsers, setSharedUsers] = useState<ISharedUser[]>([
    { id: 1, email: 'user1@example.com', name: 'User 1', canEdit: true, status: 'accepted' },
    { id: 2, email: 'user2@example.com', name: 'User 2', canEdit: false, status: 'pending' }
  ])

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
    } else {
      navigate(`/study/${collection.id}`)
    }
  }

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReview) {
      onReview(collection.id)
    }
  }

  const handleAddFlashcard = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddFlashcard) {
      onAddFlashcard(collection.id)
    } else {
      navigate(`/create-flashcard/${collection.id}`)
    }
  }

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick()
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShareModalVisible(true)
  }

  const handleShareModalClose = () => {
    setIsShareModalVisible(false)
    setShareEmail('')
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/collection/${collection.id}`
    navigator.clipboard.writeText(shareUrl)
  }

  const handleAddUser = (email: string) => {
    if (!email) return
    console.log('Adding user:', email)
    setSharedUsers([
      ...sharedUsers,
      {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        canEdit: false,
        status: 'pending'
      }
    ])
    setShareEmail('')
  }

  const handleRemoveUser = (userId: number) => {
    console.log('Removing user id:', userId)
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
  }

  const handleToggleEdit = (userId: number) => {
    console.log('Toggling edit for user id:', userId)
    setSharedUsers(sharedUsers.map((user) => (user.id === userId ? { ...user, canEdit: !user.canEdit } : user)))
  }

  const renderUserStatus = (status: ISharedUser['status']) => {
    switch (status) {
      case 'pending':
        return <Tag color='warning'>Chờ xác nhận</Tag>
      case 'accepted':
        return <Tag color='success'>Đã chấp nhận</Tag>
      case 'rejected':
        return <Tag color='error'>Đã từ chối</Tag>
      default:
        return null
    }
  }

  const getTypeTag = () => {
    switch (type) {
      case 'sharedView':
        return (
          <Tag color='green' icon={<ShareAltOutlined />}>
            Được chia sẻ (Xem)
          </Tag>
        )
      case 'sharedEdit':
        return (
          <Tag color='orange' icon={<ShareAltOutlined />}>
            Được chia sẻ (Sửa)
          </Tag>
        )
      default:
        return null
    }
  }

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        height: '100%',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <Space size='small'>
          {type === 'owned' && (
            <Tooltip title='Chỉnh sửa'>
              <Button
                type='text'
                shape='circle'
                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                onClick={handleEdit}
              />
            </Tooltip>
          )}
          {type !== 'sharedView' && (
            <Tooltip title='Thêm flashcard'>
              <Button
                type='text'
                shape='circle'
                icon={<PlusOutlined style={{ color: '#1890ff' }} />}
                onClick={handleAddFlashcard}
              />
            </Tooltip>
          )}
          {type === 'owned' && (
            <Tooltip title='Chia sẻ'>
              <Button
                type='text'
                shape='circle'
                icon={<ShareAltOutlined style={{ color: '#1890ff' }} />}
                onClick={handleShareClick}
              />
            </Tooltip>
          )}
        </Space>
      </div>
      <Card.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={
          <Space>
            {collection.name}
            {getTypeTag()}
          </Space>
        }
        description={
          <Space direction='vertical' style={{ width: '100%' }}>
            <Text>{collection.description}</Text>

            <div style={{ marginTop: 16 }}>
              <Space direction='vertical' style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text strong>Tiến độ học tập</Text>
                </Space>
                <Progress
                  percent={Math.trunc((collection.learnedWords / collection.total_flashcards) * 100)}
                  status='active'
                />
              </Space>
            </div>

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

            <Space wrap style={{ marginTop: 8 }}>
              <Tag color='purple'>
                <GlobalOutlined /> {collection.level}
              </Tag>
            </Space>

            <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
              <ClockCircleOutlined /> Cập nhật: {formatDate(collection.updated_at)}
            </Text>
          </Space>
        }
      />
      <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button type='primary' onClick={handleStudy}>
          Học
        </Button>
        <Button icon={<ClockCircleOutlined />} onClick={handleReview}>
          Ôn tập
        </Button>
      </div>

      <Modal
        title='Chia sẻ bộ sưu tập'
        open={isShareModalVisible}
        onCancel={handleShareModalClose}
        footer={null}
        width={600}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Chia sẻ qua link</Title>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={`${window.location.origin}/collection/${collection.id}`}
                readOnly
                prefix={<LinkOutlined />}
              />
              <Button type='primary' onClick={handleCopyLink}>
                Sao chép
              </Button>
            </Space.Compact>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Thêm người dùng</Title>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder='Nhập email người dùng'
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                prefix={<UserOutlined />}
              />
              <Button type='primary' onClick={() => handleAddUser(shareEmail)}>
                Thêm
              </Button>
            </Space.Compact>
          </div>

          <div>
            <Title level={5}>Người dùng đã chia sẻ</Title>
            <List
              itemLayout='horizontal'
              dataSource={sharedUsers}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    user.status === 'accepted' && (
                      <Switch
                        checkedChildren='Có thể chỉnh sửa'
                        unCheckedChildren='Chỉ xem'
                        checked={user.canEdit}
                        onChange={() => handleToggleEdit(user.id)}
                      />
                    ),
                    <Button type='link' danger onClick={() => handleRemoveUser(user.id)}>
                      Xóa
                    </Button>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        {user.name}
                        {renderUserStatus(user.status)}
                      </Space>
                    }
                    description={user.email}
                  />
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Modal>
    </Card>
  )
}

export default CollectionCard
