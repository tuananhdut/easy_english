import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Button, Card, Typography, message, Space } from 'antd'
import { ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons'
import DictionaryForm from '../components/collection/CollectionForm'
import { getCollectionById, updateCollection } from '../features/collecion/collectionApi'
import { ICollection } from '../features/collecion/collectionType'
import { DictionaryFormValues } from '../components/collection/CollectionForm'

const { Title } = Typography

const EditCollectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [collection, setCollection] = useState<ICollection | null>(null)

  useEffect(() => {
    fetchCollection()
  }, [id])

  const fetchCollection = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await getCollectionById(parseInt(id))
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
      setLoading(true)
      const response = await updateCollection(parseInt(id), values)
      if (response.status === 'success') {
        message.success('Cập nhật bộ sưu tập thành công!')
        navigate('/dashboard/dictionary')
      }
    } catch (error) {
      message.error('Không thể cập nhật bộ sưu tập')
      console.error('Error updating collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/dictionary')
  }

  const handleShare = () => {
    message.info('Chức năng chia sẻ đang được phát triển')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!collection) {
    return <div>Không tìm thấy bộ sưu tập</div>
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
                {new Date(collection.created_at).toLocaleDateString('vi-VN')}
              </span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Số thẻ{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{collection.total_flashcards} thẻ</span>
            </span>
            <span style={{ color: '#e0e0e0', fontSize: 18 }}>|</span>
            <span style={{ fontWeight: 500, color: '#555' }}>
              Người tạo{' '}
              <span style={{ color: '#222', fontWeight: 400, marginLeft: 4 }}>{collection.owner.fullName}</span>
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
          </Card>
        </Space>
      </div>
    </>
  )
}

export default EditCollectionPage
