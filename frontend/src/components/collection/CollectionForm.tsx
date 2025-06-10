import React from 'react'
import { Form, Input, Button, Select, Radio, Row, Col, Space } from 'antd'

const languageOptions = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'Tiếng Anh', value: 'en' },
  { label: 'Tiếng Nhật', value: 'ja' },
  { label: 'Tiếng Trung', value: 'zh' },
  { label: 'Tiếng Hàn', value: 'ko' }
]

const levelOptions = [
  { label: 'Cơ bản', value: 'easy' },
  { label: 'Trung cấp', value: 'medium' },
  { label: 'Nâng cao', value: 'hard' }
]

export interface DictionaryFormValues {
  name: string
  description?: string
  is_private: boolean
  source_language: string
  target_language: string
  level: string
}

export interface DictionaryFormProps {
  mode: 'create' | 'edit'
  initialData: Partial<DictionaryFormValues>
  onSubmit: (values: DictionaryFormValues) => void
  onCancel?: () => void
}

const DictionaryForm: React.FC<DictionaryFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [form] = Form.useForm<DictionaryFormValues>()

  React.useEffect(() => {
    form.setFieldsValue(initialData)
  }, [initialData, form])

  const submitText = mode === 'edit' ? 'Lưu thay đổi' : 'Tạo từ điển'
  const disableLanguages = mode === 'edit'

  return (
    <Form form={form} layout='vertical' onFinish={onSubmit} initialValues={initialData}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label='Tên bộ từ điển'
            name='name'
            rules={[{ required: true, message: 'Vui lòng nhập tên bộ từ điển!' }]}
          >
            <Input placeholder='Nhập tên bộ từ điển' size='large' />
          </Form.Item>

          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea
              placeholder='Mô tả ngắn về bộ từ điển (không bắt buộc)'
              rows={3}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item label='Quyền riêng tư' name='is_private'>
            <Radio.Group>
              <Radio value={false}>Công khai</Radio>
              <Radio value={true}>Riêng tư</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label='Ngôn ngữ của bạn' name='source_language' rules={[{ required: true }]}>
            <Select options={languageOptions} size='large' disabled={disableLanguages} />
          </Form.Item>
          <Form.Item label='Ngôn ngữ đang học' name='target_language' rules={[{ required: true }]}>
            <Select options={languageOptions} size='large' disabled={disableLanguages} />
          </Form.Item>
          <Form.Item label='Độ khó' name='level' rules={[{ required: true }]}>
            <Select options={levelOptions} size='large' />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          {onCancel && (
            <Button onClick={onCancel} size='large' style={{ minWidth: '120px' }}>
              Hủy
            </Button>
          )}
          <Button type='primary' htmlType='submit' size='large' style={{ minWidth: '120px' }}>
            {submitText}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default DictionaryForm
