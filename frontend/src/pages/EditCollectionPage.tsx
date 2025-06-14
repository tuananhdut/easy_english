import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form,
  Button,
  Card,
  Typography,
  message,
  Space,
  Modal,
  Input,
  List,
  Avatar,
  Switch,
  Tag,
  notification
} from 'antd'
import { ArrowLeftOutlined, ShareAltOutlined, UserOutlined, LinkOutlined } from '@ant-design/icons'
import DictionaryForm from '../components/collection/CollectionForm'
import { getCollectionById, updateCollection } from '../features/collecion/collectionApi'
import { ICollection } from '../features/collecion/collectionType'
import { DictionaryFormValues } from '../components/collection/CollectionForm'
import FlashcardList from '../components/flashcard/FlashcardList'
import { getFlashcardsByCollection } from '../features/flashcard/flashcardApi'
import { IFlashcard } from '../features/flashcard/flashcardType'

const { Title } = Typography

interface ISharedUser {
  id: number
  email: string
  name: string
  canEdit: boolean
  status: 'pending' | 'accepted' | 'rejected'
}

const EditCollectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [collection, setCollection] = useState<ICollection | null>(null)
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([])
  const [isShareModalVisible, setIsShareModalVisible] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [api, contextHolder] = notification.useNotification()
  const [sharedUsers, setSharedUsers] = useState<ISharedUser[]>([
    { id: 1, email: 'user1@example.com', name: 'User 1', canEdit: true, status: 'accepted' },
    { id: 2, email: 'user2@example.com', name: 'User 2', canEdit: false, status: 'pending' }
  ])

  const fetchFlashcards = async () => {
    try {
      const response = await getFlashcardsByCollection(parseInt(id || '0'))
      if (response.data) {
        const flashcardsWithUrls = response.data.map((flashcard) => ({
          ...flashcard,
          image_url: flashcard.image_url ? `${flashcard.image_url}` : undefined,
          audio_url: flashcard.audio_url ? `${flashcard.audio_url}` : undefined
        }))
        setFlashcards(flashcardsWithUrls)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      message.error('Có lỗi xảy ra khi tải danh sách flashcard!')
    }
  }

  useEffect(() => {
    fetchCollection()
    fetchFlashcards()
  }, [id])

  const fetchCollection = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await getCollectionById(parseInt(id))
      console.log(response)
      if (response.status === 'success' && response.data) {
        setCollection(response.data)
        form.setFieldsValue({
          name: response.data.name,
          description: response.data.description,
          is_private: response.data.is_private,
          level: response.data.level,
          source_language: response.data.source_language,
          target_language: response.data.target_language
        })
      }
    } catch (error) {
      message.error('Không thể tải thông tin bộ sưu tập')
      console.error('Error fetching collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async (values: DictionaryFormValues) => {
    if (!id) return
    try {
      //setLoading(true)
      const response = await updateCollection(parseInt(id), values)
      if (response.status === 'success') {
        api.success({
          message: 'Cập nhật bộ sưu tập thành công',
          description: response.message
        })
      }
    } catch (error) {
      api.error({
        message: 'Đăng nhập thất bại',
        description: JSON.stringify('lỗi sửa bộ sưu tập' + error) || 'Lỗi khi sửa'
      })
      message.error('Không thể cập nhật bộ sưu tập')
      console.error('Error updating collection:', error)
    } finally {
      //setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/dictionary')
  }

  const handleShare = () => {
    setIsShareModalVisible(true)
  }

  const handleShareModalClose = () => {
    setIsShareModalVisible(false)
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/collection/${id}`
    navigator.clipboard.writeText(shareUrl)
    message.success('Đã sao chép link chia sẻ!')
  }

  const handleAddUser = (email: string) => {
    if (!email) return
    // TODO: Call API to add user
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
    message.success('Đã gửi lời mời chia sẻ!')
  }

  const handleRemoveUser = (userId: number) => {
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
    message.success('Đã xóa người dùng!')
  }

  const handleToggleEdit = (userId: number) => {
    // TODO: Call API to update permission
    setSharedUsers(sharedUsers.map((user) => (user.id === userId ? { ...user, canEdit: !user.canEdit } : user)))
    message.success('Đã cập nhật quyền!')
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

  if (loading) {
    return <div>Loading...</div>
  }

  if (!collection) {
    return <div>Không tìm thấy bộ sưu tập</div>
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
                {new Date(collection.created_at).toLocaleDateString('vi-VN')}
              </span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Số thẻ <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{flashcards.length} thẻ</span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Người tạo{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{collection.owner.fullName}</span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Số người sử dụng{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{collection.sharedUsersCount}</span>
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
            <DictionaryForm
              mode='edit'
              initialData={{
                name: collection.name,
                description: collection.description,
                is_private: collection.is_private,
                level: collection.level,
                source_language: collection.source_language,
                target_language: collection.target_language
              }}
              onSubmit={handleFinish}
              onCancel={handleCancel}
            />
            <Title level={5}>Danh sách flashcard</Title>
            <FlashcardList flashcards={flashcards} onFlashcardChange={fetchFlashcards} />
          </Card>
        </Space>
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
              <Input value={`${window.location.origin}/collection/${id}`} readOnly prefix={<LinkOutlined />} />
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
    </div>
  )
}

export default EditCollectionPage
