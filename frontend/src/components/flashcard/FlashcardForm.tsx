import React, { useState } from 'react'
import { Form, Input, Button, Space, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'
import { getSoundApi } from '../../features/dictionary/dictionaryApi'

interface FormValues {
  term: string
  definition: string
  pronunciation?: string
}

interface FlashcardFormProps {
  initialValues?: Partial<IFlashcard>
  onSubmit: (values: FormValues, imageFile: File | null, audioFile: File | null) => void
  onCancel: () => void
  loading?: boolean
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm<FormValues>()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)

  const handleGenerateAudio = async () => {
    const term = form.getFieldValue('term')
    if (!term) {
      message.warning('Vui lòng nhập thuật ngữ trước')
      return
    }

    try {
      setGeneratingAudio(true)
      const response = await getSoundApi({
        word: term,
        accent: 'us' // Sử dụng giọng Mỹ
      })

      console.log('API Response:', response) // Debug log

      if (response.status === 'success' && response.data?.error === 0 && response.data?.data) {
        try {
          // Tải file audio từ URL
          const audioResponse = await fetch(response.data.data)
          if (!audioResponse.ok) {
            throw new Error(`HTTP error! status: ${audioResponse.status}`)
          }
          const audioBlob = await audioResponse.blob()
          console.log('Audio Blob:', audioBlob) // Debug log

          // Tạo file audio từ blob
          const audioFile = new File([audioBlob], `${term}.mp3`, {
            type: 'audio/mpeg'
          })

          // Kiểm tra file trước khi upload
          if (beforeAudioUpload(audioFile)) {
            setAudioFile(audioFile)
            message.success('Đã tạo âm thanh thành công')
          } else {
            message.error('File âm thanh không hợp lệ')
          }
        } catch (fetchError) {
          console.error('Error fetching audio:', fetchError)
          message.error('Không thể tải file âm thanh')
        }
      } else {
        console.error('Invalid API response:', response) // Debug log
        message.error('Không thể tạo âm thanh')
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      message.error('Có lỗi xảy ra khi tạo âm thanh')
    } finally {
      setGeneratingAudio(false)
    }
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values, imageFile, audioFile)
      form.resetFields()
      setImageFile(null)
      setAudioFile(null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm flashcard')
    }
  }

  const beforeImageUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!')
      return false
    }
    setImageFile(file)
    return false
  }

  const beforeAudioUpload = (file: File) => {
    const isAudio = file.type.startsWith('audio/')
    if (!isAudio) {
      message.error('Chỉ chấp nhận file âm thanh!')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('File âm thanh phải nhỏ hơn 5MB!')
      return false
    }
    setAudioFile(file)
    return false
  }

  const handleCancel = () => {
    form.resetFields()
    setImageFile(null)
    setAudioFile(null)
    onCancel()
  }

  return (
    <Form form={form} layout='vertical' initialValues={initialValues} onFinish={handleSubmit}>
      <Form.Item name='term' label='Thuật ngữ' rules={[{ required: true, message: 'Vui lòng nhập từ mới' }]}>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder='Nhập từ mới' size='large' />
          <Button type='primary' size='large' loading={generatingAudio} onClick={handleGenerateAudio}>
            Tạo âm thanh
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item name='definition' label='Định nghĩa' rules={[{ required: true, message: 'Vui lòng nhập nghĩa' }]}>
        <Input placeholder='Nhập nghĩa của từ' size='large' />
      </Form.Item>

      <Form.Item name='pronunciation' label='Phiên âm'>
        <Input placeholder='Nhập phiên âm (nếu có)' size='large' />
      </Form.Item>

      <Form.Item label='Hình ảnh'>
        <Upload
          listType='picture'
          maxCount={1}
          beforeUpload={beforeImageUpload}
          onRemove={() => setImageFile(null)}
          fileList={
            imageFile ? [{ uid: '-1', name: imageFile.name, status: 'done', url: URL.createObjectURL(imageFile) }] : []
          }
        >
          <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item label='Âm thanh'>
        <Upload
          maxCount={1}
          beforeUpload={beforeAudioUpload}
          onRemove={() => setAudioFile(null)}
          fileList={audioFile ? [{ uid: '-1', name: audioFile.name, status: 'done' }] : []}
          accept='audio/*'
        >
          <Button icon={<UploadOutlined />}>Chọn file âm thanh</Button>
        </Upload>
        {audioFile && <audio controls src={URL.createObjectURL(audioFile)} style={{ marginTop: 8, width: '100%' }} />}
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} size='large'>
            Hủy
          </Button>
          <Button type='primary' htmlType='submit' loading={loading} size='large'>
            Lưu
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default FlashcardForm
