import React, { useState, useEffect } from 'react'
import {
  Card,
  Space,
  Tag,
  Typography,
  Progress,
  Avatar,
  Button,
  Tooltip,
  Modal,
  Input,
  List,
  Switch,
  AutoComplete,
  Popconfirm
} from 'antd'
import {
  GlobalOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ShareAltOutlined
  // LinkOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ICollection, ISharedUser } from '../../features/collecion/collectionType'
import { getSharedUsers } from '../../features/collecion/collectionApi'
import { searchUsers } from '../../features/auth/authApi'
import { IUser } from '../../features/user/userType'
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
  const [sharedUsers, setSharedUsers] = useState<ISharedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<IUser[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)

  useEffect(() => {
    if (isShareModalVisible && type === 'owned') {
      fetchSharedUsers()
    }
  }, [isShareModalVisible, collection.id])

  const fetchSharedUsers = async () => {
    try {
      setLoading(true)
      const response = await getSharedUsers(collection.id)
      if (response.status === 'success') {
        setSharedUsers(response.data.users ? response.data.users : [])
      }
      console.log(response)
    } catch (error) {
      console.error('Error fetching shared users:', error)
      setSharedUsers([])
    } finally {
      setLoading(false)
    }
  }

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
    setSearchValue('')
  }

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      const response = await searchUsers(value)
      if (response.status === 'success') {
        setSearchResults(response.data.users)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchSelect = (value: string) => {
    const gmailResults = searchResults.find((user) => user.email === value)?.email
    setSearchValue(gmailResults || '')
  }

  const handleAddUser = async (email: string) => {
    if (!email) return
    try {
      const response = await addSharedUser(collection.id, email)
      if (response.status === 'success') {
        fetchSharedUsers()
        setSearchValue('')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const handleRemoveUser = (userId: number) => {
    console.log('Removing user id:', userId)
    // TODO: Implement remove user API
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
  }

  const handleToggleEdit = (userId: number) => {
    console.log('Toggling edit for user id:', userId)
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
    <>
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
              <div onClick={(e) => e.stopPropagation()}>
                <Tooltip title='Chia sẻ'>
                  <Button
                    type='text'
                    shape='circle'
                    icon={<ShareAltOutlined style={{ color: '#1890ff' }} />}
                    onClick={(e) => handleShareClick(e)}
                  />
                </Tooltip>
              </div>
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
      </Card>

      <Modal
        title='Chia sẻ bộ sưu tập'
        open={isShareModalVisible}
        onCancel={handleShareModalClose}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Space direction='vertical' style={{ width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Thêm người dùng</Title>
            <Space.Compact style={{ width: '100%' }}>
              <AutoComplete
                style={{ width: '100%' }}
                value={searchValue}
                onChange={setSearchValue}
                onSearch={handleSearch}
                onSelect={handleSearchSelect}
                options={searchResults.map((user) => ({
                  value: user.email || '',
                  label: (
                    <Space>
                      <Avatar size='small' src={user.image} icon={<UserOutlined />} />
                      <span>{user.fullName || user.email}</span>
                      <span style={{ color: '#999' }}>({user.email})</span>
                    </Space>
                  )
                }))}
                notFoundContent={searchLoading ? 'Đang tìm kiếm...' : 'Không tìm thấy người dùng'}
              >
                <Input placeholder='Tìm kiếm người dùng theo email' prefix={<UserOutlined />} allowClear />
              </AutoComplete>
              <Popconfirm
                title='Xác nhận thêm người dùng'
                description={
                  <Space direction='vertical'>
                    <p>Bạn có chắc chắn muốn thêm người dùng này vào danh sách chia sẻ?</p>
                    {searchValue && (
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <div>
                          <div style={{ color: '#999' }}>{searchValue}</div>
                        </div>
                      </Space>
                    )}
                  </Space>
                }
                onConfirm={() => {
                  if (searchValue) {
                    handleAddUser(searchValue)
                  }
                }}
                okText='Thêm'
                cancelText='Hủy'
              >
                <Button type='primary'>Thêm</Button>
              </Popconfirm>
            </Space.Compact>
          </div>

          <div>
            <Title level={5}>Người dùng đã chia sẻ</Title>
            <List
              loading={loading}
              itemLayout='horizontal'
              dataSource={sharedUsers || []}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Switch
                      checkedChildren='Có thể chỉnh sửa'
                      unCheckedChildren='Chỉ xem'
                      checked={user.permission === 'edit'}
                      onChange={() => handleToggleEdit(user.id)}
                    />,
                    <Button type='link' danger onClick={() => handleRemoveUser(user.id)}>
                      Xóa
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.image} icon={<UserOutlined />} />}
                    title={user.fullName || user.email || 'Không có tên'}
                    description={user.email || 'Không có email'}
                  />
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Modal>
    </>
  )
}

export default CollectionCard
