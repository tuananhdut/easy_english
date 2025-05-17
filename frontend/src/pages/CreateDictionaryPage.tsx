import React from 'react'
import { Card, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import DictionaryForm, { DictionaryFormValues } from '../components/DictionaryForm'

const { Title } = Typography

const CreateDictionaryPage: React.FC = () => {
  const navigate = useNavigate()

  const handleFinish = (values: DictionaryFormValues) => {
    const newId = Date.now().toString()
    message.success(`Tạo bộ từ điển "${values.name}" thành công!`)
    navigate(`/create-flashcard/${newId}`)
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', background: '#f0f2f5', borderRadius: 12 }}>
      <div style={{ padding: '32px 24px' }}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
            Tạo bộ từ điển mới
          </Title>
          <DictionaryForm
            mode='create'
            initialData={{
              name: '',
              description: '',
              is_private: true,
              source_language: 'vi',
              target_language: 'en',
              level: 'easy'
            }}
            onSubmit={handleFinish}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    </div>
  )
}

export default CreateDictionaryPage
