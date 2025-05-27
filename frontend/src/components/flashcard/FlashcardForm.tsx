import React from 'react'
import { Form, Input, Button, Space, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { IFlashcard } from '../../features/flashcard/flashcardType'

interface FlashcardFormProps {
  initialValues?: Partial<IFlashcard>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: any) => void
  onCancel: () => void
  loading?: boolean
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    onSubmit(values)
  }

  return (
    <Form form={form} layout='vertical' initialValues={initialValues} onFinish={handleSubmit}>
      <Form.Item name='front_text' label='Từ mới' rules={[{ required: true, message: 'Vui lòng nhập từ mới' }]}>
        <Input placeholder='Nhập từ mới' />
      </Form.Item>

      <Form.Item name='back_text' label='Nghĩa' rules={[{ required: true, message: 'Vui lòng nhập nghĩa' }]}>
        <Input placeholder='Nhập nghĩa của từ' />
      </Form.Item>

      <Form.Item name='pronunciation' label='Phát âm'>
        <Input placeholder='Nhập phát âm (nếu có)' />
      </Form.Item>

      <Form.Item name='image_url' label='Hình ảnh'>
        <Upload listType='picture' maxCount={1} beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item name='audio_url' label='Âm thanh'>
        <Upload maxCount={1} beforeUpload={() => false} accept='audio/*'>
          <Button icon={<UploadOutlined />}>Chọn file âm thanh</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type='primary' htmlType='submit' loading={loading}>
            Lưu
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default FlashcardForm
