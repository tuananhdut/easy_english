import React, { useState, useEffect } from 'react'
import { Select, Input, Button, Space, Typography, Tooltip, Card, message } from 'antd'
import { SearchOutlined, SwapOutlined, TranslationOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

const SearchPage: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en') // Ngôn ngữ nguồn (mặc định: Tiếng Anh)
  const [targetLang, setTargetLang] = useState('vi') // Ngôn ngữ đích (mặc định: Tiếng Việt)
  const [inputText, setInputText] = useState('') // Văn bản nhập
  const [translatedText, setTranslatedText] = useState('') // Kết quả dịch
  const [isTranslating, setIsTranslating] = useState(false) // Trạng thái dịch
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        minHeight: '100vh',
        padding: isMobile ? '16px' : '32px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Card
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
          <Title
            level={isMobile ? 3 : 2}
            style={{
              color: '#1890ff',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: isMobile ? '24px' : '32px'
            }}
          >
            <TranslationOutlined style={{ fontSize: isMobile ? '24px' : '32px' }} />
            Dịch Văn Bản
          </Title>
          <Text type='secondary' style={{ fontSize: isMobile ? '14px' : '16px' }}>
            Dịch văn bản giữa các ngôn ngữ khác nhau
          </Text>
        </div>

        <Space direction='vertical' size={isMobile ? 'middle' : 'large'} style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '16px',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <Select
                value={sourceLang}
                onChange={setSourceLang}
                style={{
                  width: isMobile ? 'calc(50% - 4px)' : '220px',
                  borderRadius: '8px'
                }}
                placeholder='Chọn ngôn ngữ nguồn'
                size={isMobile ? 'middle' : 'large'}
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
                    fontSize: isMobile ? '16px' : '20px',
                    color: '#1890ff',
                    transition: 'transform 0.2s',
                    background: 'transparent',
                    padding: isMobile ? '4px' : '8px',
                    minWidth: '32px'
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
                  width: isMobile ? 'calc(50% - 4px)' : '220px',
                  borderRadius: '8px'
                }}
                placeholder='Chọn ngôn ngữ đích'
                size={isMobile ? 'middle' : 'large'}
              >
                {languages.map((lang) => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Nhập văn bản cần dịch...'
              rows={isMobile ? 3 : 4}
              autoSize={{ minRows: isMobile ? 3 : 4, maxRows: isMobile ? 5 : 6 }}
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderColor: '#d9d9d9',
                transition: 'all 0.3s',
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '12px' : '16px',
                paddingRight: '80px'
              }}
              className='hover:border-blue-400 focus:border-blue-400'
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                display: 'flex',
                gap: '4px'
              }}
            >
              <Tooltip title='Sao chép'>
                <Button
                  type='text'
                  icon={<CopyOutlined />}
                  onClick={() => {
                    if (inputText) {
                      navigator.clipboard.writeText(inputText)
                      message.success('Đã sao chép vào clipboard!')
                    }
                  }}
                  style={{
                    color: '#1890ff',
                    padding: '4px 8px',
                    height: 'auto',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '4px'
                  }}
                />
              </Tooltip>
              <Tooltip title='Dán'>
                <Button
                  type='text'
                  icon={<FileTextOutlined />}
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      setInputText(text)
                      message.success('Đã dán văn bản!')
                    } catch {
                      message.error('Không thể dán văn bản!')
                    }
                  }}
                  style={{
                    color: '#1890ff',
                    padding: '4px 8px',
                    height: 'auto',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '4px'
                  }}
                />
              </Tooltip>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button
              type='primary'
              icon={<SearchOutlined />}
              onClick={handleTranslate}
              size={isMobile ? 'middle' : 'large'}
              loading={isTranslating}
              style={{
                background: 'linear-gradient(45deg, #1890ff, #40c4ff)',
                border: 'none',
                borderRadius: '12px',
                padding: isMobile ? '0 24px' : '0 32px',
                height: isMobile ? '40px' : '48px',
                fontSize: isMobile ? '14px' : '16px',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                transition: 'all 0.3s'
              }}
              className='hover:scale-105'
            >
              Dịch
            </Button>
          </div>

          {translatedText && (
            <Card
              style={{
                marginTop: isMobile ? '16px' : '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: 'none',
                background: '#f8f9fa'
              }}
            >
              <Text
                strong
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: '#2c3e50',
                  marginBottom: '8px',
                  display: 'block'
                }}
              >
                Kết quả dịch:
              </Text>
              <div
                style={{
                  padding: isMobile ? '12px' : '16px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  color: '#333',
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: '1.6',
                  minHeight: isMobile ? '80px' : '100px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  position: 'relative'
                }}
              >
                {translatedText}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px'
                  }}
                >
                  <Tooltip title='Sao chép'>
                    <Button
                      type='text'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText)
                        message.success('Đã sao chép vào clipboard!')
                      }}
                      style={{
                        color: '#1890ff',
                        padding: '4px 8px',
                        height: 'auto',
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '4px'
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default SearchPage
