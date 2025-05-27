import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Form, Input, Button, Upload, Row, Col, message, notification } from 'antd'
import { UploadOutlined, AudioOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { createFlashcard, deleteFlashcard, getFlashcardsByCollection } from '../features/flashcard/flashcardApi'
import { ICreateFlashcardRequest, IFlashcard } from '../features/flashcard/flashcardType'

const { Title, Text } = Typography
const FILE_URL = import.meta.env.VITE_FILE_URL || 'http://localhost:8089/uploads/'

interface FormValues {
  front_text: string
  back_text: string
}

const CreateFlashcardPage: React.FC = () => {
  const [api, contextHolder] = notification.useNotification()
  const { id: collectionId } = useParams<{ id: string }>()
  const [form] = Form.useForm<FormValues>()
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const navigate = useNavigate()

  const fetchFlashcards = async () => {
    try {
      const response = await getFlashcardsByCollection(parseInt(collectionId || '0'))
      if (response.data) {
        const flashcardsWithUrls = response.data.map((flashcard) => ({
          ...flashcard,
          image_url: flashcard.image_url ? `${FILE_URL}${flashcard.image_url}` : undefined,
          audio_url: flashcard.audio_url ? `${FILE_URL}${flashcard.audio_url}` : undefined
        }))
        setFlashcards(flashcardsWithUrls)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      message.error('Có lỗi xảy ra khi tải danh sách flashcard!')
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [collectionId])

  const handleAdd = async (values: FormValues) => {
    try {
      const flashcardData: ICreateFlashcardRequest = {
        collection_id: parseInt(collectionId || '0'),
        front_text: values.front_text,
        back_text: values.back_text,
        image: imageFile || undefined,
        audio: audioFile || undefined
      }

      const response = await createFlashcard(flashcardData)

      if (response.status === 'success') {
        form.resetFields()
        setImageFile(null)
        setAudioFile(null)
        message.success('Thêm flashcard thành công!')
        fetchFlashcards()
        api.success({
          message: 'Thêm flashcard thành công',
          description: 'Flashcard đã được thêm vào hệ thống'
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      api.error({
        message: 'Thêm flashcard thất bại',
        description: JSON.stringify('Có lỗi xảy ra khi thêm flashcard')
      })
    }
  }

  const handleEdit = (idx: number) => {
    const fc = flashcards[idx]
    form.setFieldsValue({ front_text: fc.front_text, back_text: fc.back_text })
    setImageFile(null)
    setAudioFile(null)
    message.info('Đã điền dữ liệu flashcard lên form để sửa')
  }

  const handleDelete = async (idx: number) => {
    try {
      const flashcard = flashcards[idx]
      if (!flashcard.id) {
        api.error({
          message: 'Lỗi xóa flashcard',
          description: 'Không thể xóa flashcard chưa được lưu!'
        })
        return
      }

      const response = await deleteFlashcard(flashcard.id)

      if (response.status === 'success') {
        fetchFlashcards()
        api.success({
          message: 'Xóa flashcard thành công',
          description: 'Flashcard đã được xóa khỏi hệ thống'
        })
      } else {
        api.error({
          message: 'Xóa flashcard thất bại',
          description: response.message || 'Có lỗi xảy ra khi xóa flashcard'
        })
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      api.error({
        message: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra khi xóa flashcard'
      })
    }
  }

  const handleBack = () => {
    navigate('/dashboard/dictionary')
  }

  const beforeImageUpload = (file: File) => {
    setImageFile(file)
    return false
  }

  const beforeAudioUpload = (file: File) => {
    setAudioFile(file)
    return false
  }

  return (
    <>
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
              onClick={handleBack}
              style={{
                marginRight: 16,
                color: '#1890ff',
                fontSize: '16px'
              }}
            />
            <Title level={3} style={{ flex: 1, margin: 0 }}>
              Thêm Flashcard cho bộ từ điển
            </Title>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '32px auto', background: '#f0f2f5', minHeight: '100vh', borderRadius: 12 }}>
        <div style={{ padding: '32px 24px' }}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Text strong>Bộ từ điển ID: {collectionId}</Text>
            <Form form={form} layout='vertical' onFinish={handleAdd} style={{ marginTop: 24 }}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label='Từ mới'
                    name='front_text'
                    rules={[{ required: true, message: 'Vui lòng nhập mặt trước!' }]}
                  >
                    <Input placeholder='Nhập từ hoặc cụm từ' />
                  </Form.Item>
                  <Form.Item
                    label='Nghĩa'
                    name='back_text'
                    rules={[{ required: true, message: 'Vui lòng nhập nghĩa!' }]}
                  >
                    <Input placeholder='Nhập nghĩa' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label='Ảnh minh họa'>
                    <Upload beforeUpload={beforeImageUpload} showUploadList={!!imageFile} accept='image/*' maxCount={1}>
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {imageFile && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt='preview'
                          style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4 }}
                        />
                      </div>
                    )}
                  </Form.Item>
                  <Form.Item label='Âm thanh'>
                    <Upload beforeUpload={beforeAudioUpload} showUploadList={!!audioFile} accept='audio/*' maxCount={1}>
                      <Button icon={<AudioOutlined />}>Chọn file âm thanh</Button>
                    </Upload>
                    {audioFile && (
                      <div style={{ marginTop: 8 }}>
                        <audio controls src={URL.createObjectURL(audioFile)} />
                      </div>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type='primary' htmlType='submit' size='large' style={{ minWidth: 140 }}>
                  Thêm flashcard
                </Button>
              </Form.Item>
            </Form>

            <div style={{ margin: '32px 0' }}>
              <Title level={5}>Danh sách flashcard đã thêm</Title>
              <Row gutter={[16, 16]}>
                {flashcards.length === 0 && (
                  <Col span={24} style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
                    Chưa có flashcard nào.
                  </Col>
                )}
                {flashcards.map((item, idx) => (
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
                      styles={{
                        body: {
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%'
                        }
                      }}
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
                          icon={<UploadOutlined />}
                          size='small'
                          onClick={() => handleEdit(idx)}
                          key='edit'
                          type='text'
                        >
                          Sửa
                        </Button>,
                        <Button danger size='small' onClick={() => handleDelete(idx)} key='delete' type='text'>
                          Xóa
                        </Button>
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
                          {item.front_text}
                        </Text>
                        <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{item.back_text}</Text>
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
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default CreateFlashcardPage
