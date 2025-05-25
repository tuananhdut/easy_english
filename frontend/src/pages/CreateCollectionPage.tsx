import React from 'react'
import { Button, Card, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import DictionaryForm, { DictionaryFormValues } from '../components/collection/CollectionForm'
import { createCollection } from '../features/collecion/collectionApi'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title } = Typography

const CreateDictionaryPage: React.FC = () => {
  const navigate = useNavigate()

  const handleFinish = async (values: DictionaryFormValues) => {
    try {
      const response = await createCollection({
        name: values.name,
        description: values.description,
        is_private: values.is_private,
        level: values.level
      })

      if (response && response.data.id) {
        message.success(`Tạo bộ từ điển "${values.name}" thành công!`)
        navigate(`/create-flashcard/${response.data.id}`)
      } else {
        message.error('Có lỗi xảy ra khi tạo bộ từ điển')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tạo bộ từ điển')
      console.error('Error creating collection:', error)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
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
              Tạo bộ từ điển mới
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px' }}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <DictionaryForm
            mode='create'
            initialData={{
              name: '',
              description: '',
              is_private: true,
              level: 'easy'
            }}
            onSubmit={handleFinish}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    </>
  )
}

export default CreateDictionaryPage
