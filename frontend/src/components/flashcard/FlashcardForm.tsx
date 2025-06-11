import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Space, Upload, notification } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'

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
  const [api, contextHolder] = notification.useNotification()

  // Reset form when initialValues changes
  useEffect(() => {
    if (initialValues) {
      const formValues = {
        term: initialValues.term || '',
        definition: initialValues.definition || '',
        pronunciation: initialValues.pronunciation || ''
      }
      form.setFieldsValue(formValues)
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values, imageFile, audioFile)
      if (!initialValues) {
        form.resetFields()
        setImageFile(null)
        setAudioFile(null)
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      api.error({
        message: 'Thêm Flashcard thất bại',
        description: 'Có lỗi xảy ra khi thêm flashcard!'
      })
    }
  }

  const beforeImageUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      api.error({
        message: 'Tải ảnh thất bại',
        description: 'Chỉ chấp nhận file ảnh!'
      })
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      api.error({
        message: 'Tải ảnh thất bại',
        description: 'Ảnh phải nhỏ hơn 2MB!'
      })
      return false
    }
    setImageFile(file)
    return false
  }

  const beforeAudioUpload = (file: File) => {
    const isAudio = file.type.startsWith('audio/')
    if (!isAudio) {
      api.error({
        message: 'Tải âm thanh thất bại',
        description: 'Chỉ chấp nhận file âm thanh!'
      })
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      api.error({
        message: 'Tải âm thanh thất bại',
        description: 'File âm thanh phải nhỏ hơn 5MB!'
      })
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
    <Form
      form={form}
      layout='vertical'
      onFinish={handleSubmit}
      initialValues={
        initialValues
          ? {
              term: initialValues.term || '',
              definition: initialValues.definition || '',
              pronunciation: initialValues.pronunciation || ''
            }
          : undefined
      }
    >
      {contextHolder}
      <Form.Item name='term' label='Thuật ngữ' rules={[{ required: true, message: 'Vui lòng nhập từ mới' }]}>
        <Input placeholder='Nhập từ mới' size='large' />
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
            imageFile
              ? [{ uid: '-1', name: imageFile.name, status: 'done', url: URL.createObjectURL(imageFile) }]
              : initialValues?.image_url
                ? [{ uid: '-1', name: 'current-image', status: 'done', url: initialValues.image_url }]
                : []
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
          fileList={
            audioFile
              ? [{ uid: '-1', name: audioFile.name, status: 'done' }]
              : initialValues?.audio_url
                ? [{ uid: '-1', name: 'current-audio', status: 'done' }]
                : []
          }
          accept='audio/*'
        >
          <Button icon={<UploadOutlined />}>Chọn file âm thanh</Button>
        </Upload>

        {(audioFile || initialValues?.audio_url) && (
          <audio
            controls
            src={audioFile ? URL.createObjectURL(audioFile) : initialValues?.audio_url}
            style={{ marginTop: 8, width: '100%' }}
          />
        )}
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} size='large'>
            Hủy
          </Button>
          <Button type='primary' htmlType='submit' loading={loading} size='large'>
            {initialValues ? 'Cập nhật' : 'Lưu'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default FlashcardForm
