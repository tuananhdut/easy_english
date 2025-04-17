import React, { useState } from 'react'
import { Select, Input, Button, Space, Typography, Tooltip } from 'antd'
import { SearchOutlined, SwapOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

const SearchPage: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en') // Ngôn ngữ nguồn (mặc định: Tiếng Anh)
  const [targetLang, setTargetLang] = useState('vi') // Ngôn ngữ đích (mặc định: Tiếng Việt)
  const [inputText, setInputText] = useState('') // Văn bản nhập
  const [translatedText, setTranslatedText] = useState('') // Kết quả dịch
  const [isTranslating, setIsTranslating] = useState(false) // Trạng thái dịch

  // Danh sách ngôn ngữ
  const languages = [
    { code: 'en', name: 'Tiếng Anh' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'fr', name: 'Tiếng Pháp' },
    { code: 'es', name: 'Tiếng Tây Ban Nha' },
    { code: 'zh', name: 'Tiếng Trung' }
  ]

  // Xử lý hoán đổi ngôn ngữ
  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setTranslatedText('') // Xóa kết quả dịch
  }

  // Xử lý khi bấm nút dịch
  const handleTranslate = () => {
    if (!inputText) {
      setTranslatedText('Vui lòng nhập văn bản để dịch.')
      return
    }

    setIsTranslating(true)
    // Giả lập chức năng dịch với delay
    setTimeout(() => {
      const mockTranslation = `Đã dịch từ ${sourceLang} sang ${targetLang}: ${inputText}`
      setTranslatedText(mockTranslation)
      setIsTranslating(false)
    }, 1000)
  }

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        background: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minHeight: '100vh'
      }}
    >
      <Title
        level={2}
        style={{
          textAlign: 'center',
          color: '#2c3e50',
          marginBottom: '24px',
          fontWeight: 600
        }}
      >
        TRA CỨU TỪ ĐIỂN
      </Title>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* Chọn ngôn ngữ nguồn, icon chuyển đổi, và ngôn ngữ đích */}
        <Space
          direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          size='middle'
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Select
            value={sourceLang}
            onChange={setSourceLang}
            style={{
              width: window.innerWidth < 768 ? '100%' : '220px',
              borderRadius: '8px'
            }}
            placeholder='Chọn ngôn ngữ nguồn'
            size='large'
          >
            {languages.map((lang) => (
              <Option key={lang.code} value={lang.code}>
                {lang.name}
              </Option>
            ))}
          </Select>

          <Tooltip title='Hoán đổi ngôn ngữ'>
            <Button
              icon={<SwapOutlined />}
              onClick={handleSwapLanguages}
              style={{
                border: 'none',
                fontSize: '20px',
                color: '#1890ff',
                transition: 'transform 0.2s'
              }}
              className='hover:scale-110'
              aria-label='Hoán đổi ngôn ngữ'
              disabled={isTranslating}
            />
          </Tooltip>

          <Select
            value={targetLang}
            onChange={setTargetLang}
            style={{
              width: window.innerWidth < 768 ? '100%' : '220px',
              borderRadius: '8px'
            }}
            placeholder='Chọn ngôn ngữ đích'
            size='large'
          >
            {languages.map((lang) => (
              <Option key={lang.code} value={lang.code}>
                {lang.name}
              </Option>
            ))}
          </Select>
        </Space>

        {/* Ô nhập văn bản */}
        <TextArea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Nhập văn bản tiếng Anh để dịch'
          rows={3}
          autoSize={{ minRows: 3, maxRows: 5 }}
          style={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderColor: '#d9d9d9',
            transition: 'all 0.3s'
          }}
          className='hover:border-blue-400'
        />

        {/* Nút dịch */}
        <div style={{ textAlign: 'center' }}>
          <Button
            type='primary'
            icon={<SearchOutlined />}
            onClick={handleTranslate}
            size='large'
            loading={isTranslating}
            style={{
              background: 'linear-gradient(45deg, #1890ff, #40c4ff)',
              border: 'none',
              borderRadius: '8px',
              padding: '0 24px',
              height: '48px',
              fontSize: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
            className='hover:scale-105'
          >
            Dịch
          </Button>
        </div>

        {/* Hiển thị kết quả dịch */}
        {translatedText && (
          <div style={{ marginTop: '24px' }}>
            <Text strong style={{ fontSize: '16px', color: '#2c3e50' }}>
              Kết quả dịch:
            </Text>
            <div
              style={{
                marginTop: '8px',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                color: '#333',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
            >
              {translatedText}
            </div>
          </div>
        )}
      </Space>
    </div>
  )
}

export default SearchPage
