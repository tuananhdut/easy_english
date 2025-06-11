import React, { useState, useEffect } from 'react'
import { Card, Avatar, Typography, Row, Col, Statistic, Tabs, List, Space, Button, Upload, message } from 'antd'
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  UploadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../app/store'
import { ICollection } from '../features/collecion/collectionType'
import { getOwnCollections } from '../features/collecion/collectionApi'
import { statisticsConsecutiveDays } from '../features/statistics/statisticsApi'
import CollectionCard from '../components/collection/ColectionCard'
import type { UploadProps } from 'antd'

const { Title, Text } = Typography

const ProfilePage: React.FC = () => {
  const [collections, setCollections] = useState<ICollection[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    fetchCollections()
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await statisticsConsecutiveDays()
      if (response.status === 'success' && response.data) {
        setStreakDays(response.data.consecutiveDays)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await getOwnCollections()
      if (response.status === 'success' && response.data?.collections) {
        setCollections(response.data.collections)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (collectionId: string) => {
    navigate(`/edit-collection/${collectionId}`)
  }

  const handleStudy = (collectionId: number) => {
    navigate(`/study/${collectionId}`)
  }

  const handleReview = (collectionId: number) => {
    navigate(`/study/${collectionId}?mode=review`)
  }

  const handleAvatarUpload: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      return
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`)
      // TODO: Update user avatar in Redux store and backend
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  const totalWords = collections.reduce((sum, collection) => sum + collection.total_flashcards, 0)
  const learnedWords = collections.reduce((sum, collection) => sum + (collection.learnedWords || 0), 0)
  const reviewWords = collections.reduce((sum, collection) => sum + (collection.reviewWords || 0), 0)

  const items = [
    {
      key: '1',
      label: 'Bộ sưu tập của tôi',
      children: (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={collections}
          loading={loading}
          renderItem={(collection) => (
            <List.Item>
              <CollectionCard
                collection={collection}
                type='owned'
                onEdit={() => handleEdit(collection.id.toString())}
                onStudy={handleStudy}
                onReview={handleReview}
              />
            </List.Item>
          )}
        />
      )
    },
    {
      key: '2',
      label: 'Thống kê học tập',
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic title='Tổng số từ' value={totalWords} prefix={<BookOutlined />} />
            </Col>
            <Col span={6}>
              <Statistic title='Đã học' value={learnedWords} prefix={<CheckCircleOutlined />} />
            </Col>
            <Col span={6}>
              <Statistic title='Cần ôn tập' value={reviewWords} prefix={<ClockCircleOutlined />} />
            </Col>
          </Row>
        </Card>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Card>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative' }}>
              <Avatar size={64} icon={<UserOutlined />} src={user?.image} />
              <Upload
                name='avatar'
                showUploadList={false}
                onChange={handleAvatarUpload}
                // customRequest={({ file, onSuccess }) => {
                //   setTimeout(() => {
                //     onSuccess?.('ok')
                //   }, 0)
                // }}
              >
                <Button
                  icon={<UploadOutlined />}
                  size='small'
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    borderRadius: '50%',
                    padding: '4px',
                    minWidth: 'auto'
                  }}
                />
              </Upload>
            </div>
            <div>
              <Title level={3}>{user?.fullName || user?.email}</Title>
              <Text type='secondary'>{user?.email}</Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Text>
                    <FireOutlined style={{ color: '#ff4d4f' }} /> {streakDays} ngày liên tiếp
                  </Text>
                </Space>
              </div>
            </div>
          </div>

          <Tabs defaultActiveKey='1' items={items} />
        </Space>
      </Card>
    </div>
  )
}

export default ProfilePage
