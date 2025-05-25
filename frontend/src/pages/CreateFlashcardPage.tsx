import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Form, Input, Button, Upload, AutoComplete, Row, Col, message } from 'antd'
import { UploadOutlined, AudioOutlined, ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface Flashcard {
  term: string
  meaning: string
  image_url?: string
  audio_url?: string
}

const CreateFlashcardPage: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const navigate = useNavigate()
  const [autoOptions, setAutoOptions] = useState<Array<{ value: string; label: React.ReactNode }>>([])
  const [search, setSearch] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const mockTerms = [
    {
      value: 'apple',
      meaning: 'quả táo',
      image: 'https://cdn-icons-png.flaticon.com/128/415/415733.png',
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      value: 'banana',
      meaning: 'quả chuối',
      image: 'https://cdn-icons-png.flaticon.com/128/415/415734.png',
      audio: ''
    },
    { value: 'cat', meaning: 'con mèo', image: 'https://cdn-icons-png.flaticon.com/128/616/616408.png', audio: '' },
    {
      value: 'dog',
      meaning: 'con chó',
      image: 'https://cdn-icons-png.flaticon.com/128/616/616408.png',
      audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    { value: 'hello world', meaning: 'xin chào thế giới', image: '', audio: '' },
    { value: 'good morning', meaning: 'chào buổi sáng', image: '', audio: '' },
    {
      value: 'computer',
      meaning: 'máy tính',
      image: 'https://cdn-icons-png.flaticon.com/128/424/424062.png',
      audio: ''
    },
    { value: 'university', meaning: 'trường đại học', image: '', audio: '' },
    { value: 'student', meaning: 'học sinh', image: '', audio: '' },
    { value: 'teacher', meaning: 'giáo viên', image: '', audio: '' },
    { value: 'book', meaning: 'quyển sách', image: 'https://cdn-icons-png.flaticon.com/128/29/29302.png', audio: '' },
    { value: 'pen', meaning: 'bút', image: 'https://cdn-icons-png.flaticon.com/128/29/29302.png', audio: '' },
    { value: 'notebook', meaning: 'vở', image: '', audio: '' },
    { value: 'car', meaning: 'xe hơi', image: 'https://cdn-icons-png.flaticon.com/128/743/743131.png', audio: '' },
    { value: 'bus', meaning: 'xe buýt', image: '', audio: '' },
    { value: 'train', meaning: 'tàu hỏa', image: '', audio: '' },
    {
      value: 'phone',
      meaning: 'điện thoại',
      image: 'https://cdn-icons-png.flaticon.com/128/724/724664.png',
      audio: ''
    },
    { value: 'music', meaning: 'âm nhạc', image: '', audio: '' },
    { value: 'movie', meaning: 'phim', image: '', audio: '' },
    { value: 'friend', meaning: 'bạn bè', image: '', audio: '' }
  ]

  const handleTermSearch = (value: string) => {
    setAutoOptions(
      !value
        ? []
        : mockTerms
            .filter((term) => term.value.toLowerCase().includes(value.toLowerCase()))
            .map((term) => ({
              value: term.value,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {term.image && (
                    <img
                      src={term.image}
                      alt=''
                      style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{term.value}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{term.meaning}</div>
                  </div>
                  {term.audio && (
                    <audio controls src={term.audio} style={{ height: 28 }} onClick={(e) => e.stopPropagation()} />
                  )}
                </div>
              )
            }))
    )
  }

  const handleAdd = (values: Flashcard) => {
    const newCard: Flashcard = {
      ...values,
      image_url: imageFile ? URL.createObjectURL(imageFile) : undefined,
      audio_url: audioFile ? URL.createObjectURL(audioFile) : undefined
    }
    if (editingIndex !== null) {
      // Edit mode
      const updated = [...flashcards]
      updated[editingIndex] = newCard
      setFlashcards(updated)
      setEditingIndex(null)
    } else {
      setFlashcards([...flashcards, newCard])
    }
    form.resetFields()
    setImageFile(null)
    setAudioFile(null)
  }

  const handleEdit = (idx: number) => {
    const fc = flashcards[idx]
    form.setFieldsValue({ term: fc.term, meaning: fc.meaning })
    setImageFile(null)
    setAudioFile(null)
    setEditingIndex(idx)
    message.info('Đã điền dữ liệu flashcard lên form để sửa')
  }

  const handleDelete = (idx: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== idx))
    message.success('Đã xóa flashcard!')
    if (editingIndex === idx) {
      setEditingIndex(null)
      form.resetFields()
      setImageFile(null)
      setAudioFile(null)
    }
  }

  const handleSave = () => {
    message.success('Lưu flashcard thành công!')
    navigate('/dashboard/dictionary')
  }

  const beforeImageUpload = (file: File) => {
    setImageFile(file)
    return false // prevent auto upload
  }

  const beforeAudioUpload = (file: File) => {
    setAudioFile(file)
    return false // prevent auto upload
  }

  const handleBack = () => {
    navigate('/dashboard/dictionary')
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
                    name='term'
                    rules={[{ required: true, message: 'Vui lòng nhập mặt trước!' }]}
                  >
                    <AutoComplete
                      placeholder='Nhập từ hoặc cụm từ'
                      style={{ width: '100%' }}
                      options={autoOptions}
                      onSearch={handleTermSearch}
                    />
                  </Form.Item>
                  <Form.Item label='Nghĩa' name='meaning' rules={[{ required: true, message: 'Vui lòng nhập nghĩa!' }]}>
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
              <Input.Search
                placeholder='Tìm kiếm từ hoặc nghĩa...'
                allowClear
                style={{ width: 260, marginBottom: 16 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size='large'
              />
              <Row gutter={[16, 16]}>
                {flashcards.filter(
                  (item) =>
                    item.term.toLowerCase().includes(search.toLowerCase()) ||
                    item.meaning.toLowerCase().includes(search.toLowerCase())
                ).length === 0 && (
                  <Col span={24} style={{ textAlign: 'center', color: '#888', padding: '32px' }}>
                    Chưa có flashcard nào.
                  </Col>
                )}
                {flashcards
                  .filter(
                    (item) =>
                      item.term.toLowerCase().includes(search.toLowerCase()) ||
                      item.meaning.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item, idx) => (
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
                        bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}
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
                            {item.term}
                          </Text>
                          <Text style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>{item.meaning}</Text>
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
            <Button
              type='primary'
              block
              size='large'
              onClick={handleSave}
              disabled={flashcards.length === 0}
              style={{ borderRadius: 8 }}
            >
              Lưu tất cả flashcard
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}

export default CreateFlashcardPage
