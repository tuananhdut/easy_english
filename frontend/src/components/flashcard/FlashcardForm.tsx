import React, { useState } from 'react'
import { Form, Input, Button, Space, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'

interface FormValues {
  front_text: string
  back_text: string
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
      <Form.Item name='front_text' label='Thuật ngữ' rules={[{ required: true, message: 'Vui lòng nhập từ mới' }]}>
        <Input placeholder='Nhập từ mới' size='large' />
      </Form.Item>

      <Form.Item name='back_text' label='Định nghĩa' rules={[{ required: true, message: 'Vui lòng nhập nghĩa' }]}>
        <Input placeholder='Nhập nghĩa của từ' size='large' />
      </Form.Item>

      <Form.Item name='pronunciation' label='Phát âm'>
        <Input placeholder='Nhập phát âm (nếu có)' size='large' />
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
