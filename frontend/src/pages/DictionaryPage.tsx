import React, { useState } from 'react'
import { AutoComplete, Card, Tabs, Typography, Space, Button, List, Tag, Spin, message } from 'antd'
import { SearchOutlined, BookOutlined, StarOutlined, GlobalOutlined } from '@ant-design/icons'
import { searchDictionaryApi } from '../features/dictionary/dictionaryApi'
import { DictionaryApiResponse, SearchDataDictionary, SearchParams } from '../features/dictionary/dictionarytypes'
import axios from 'axios'
import '../styles/laban.css'

const { Text } = Typography

interface Course {
  id: number
  title: string
  description: string
  level: string
  duration: string
  lessons: number
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Tiếng Anh Cơ Bản',
    description: 'Khóa học dành cho người mới bắt đầu học tiếng Anh',
    level: 'Cơ bản',
    duration: '3 tháng',
    lessons: 30
  },
  {
    id: 2,
    title: 'Tiếng Anh Giao Tiếp',
    description: 'Học cách giao tiếp tự tin trong các tình huống hàng ngày',
    level: 'Trung cấp',
    duration: '4 tháng',
    lessons: 40
  },
  {
    id: 3,
    title: 'Tiếng Anh Thương Mại',
    description: 'Tiếng Anh chuyên ngành cho môi trường kinh doanh',
    level: 'Nâng cao',
    duration: '6 tháng',
    lessons: 50
  }
]

const DictionaryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<DictionaryApiResponse | null>(null)
  const [content, setContent] = useState(false)

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setSearchResults(null)
      return
    }

    const resultElement = document.getElementById('result')
    if (resultElement) {
      resultElement.innerHTML = ''
    }

    try {
      setLoading(true)
      const params: SearchParams = {
        query: value,
        type: 1,
        site: 'dictionary'
      }

      const results = await searchDictionaryApi(params)
      console.log(results)
      setSearchResults(results)
    } catch (error) {
      message.error('Không thể tìm kiếm từ điển. Vui lòng thử lại sau.')
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const test = async (value: string) => {
    setContent(true)
    try {
      const result = await axios.get('https://dict.laban.vn/ajax/find', {
        params: {
          type: 1,
          query: value
        }
      })

      const htmlContent = result.data?.enViData?.best?.details ?? '<div>Tìm kiếm thất bại</div>'

      // Gán nội dung nếu có
      const resultElement = document.getElementById('result')
      if (resultElement) {
        resultElement.innerHTML = htmlContent
      }

      console.log(`Test value: ${value}`, result)
    } catch (error) {
      console.error('Fetch failed:', error)
    }
  }

  // Hàm tùy chỉnh giao diện mỗi gợi ý trong dropdown
  const renderOption = (suggestion: SearchDataDictionary) => ({
    value: suggestion.select, // Giá trị để AutoComplete sử dụng
    label: (
      <div
        style={{
          padding: '8px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text strong style={{ fontSize: '16px' }}>
            <span dangerouslySetInnerHTML={{ __html: suggestion.select }} />
          </Text>
          {suggestion.pronunciation && (
            <Space>
              <Text type='secondary'>[{suggestion.pronunciation}]</Text>
              <img
                src='https://stc-laban.zdn.vn/dictionary/images/vi_dict_EV_icon.png'
                alt='audio icon'
                style={{ marginLeft: '5px', position: 'relative', top: '2px' }}
              />
            </Space>
          )}
        </Space>
        <Text>{suggestion.meaning || 'Không có nghĩa'}</Text>
      </div>
    )
  })

  const items = [
    {
      key: '1',
      label: (
        <span>
          <SearchOutlined />
          Tra Từ Điển
        </span>
      ),
      children: (
        <Card style={{ marginBottom: '24px' }}>
          <Space direction='vertical' style={{ width: '100%' }}>
            <AutoComplete
              style={{ width: '100%' }}
              value={searchTerm}
              onChange={(value) => handleSearch(value)} // Cập nhật searchTerm khi nhập
              onSearch={handleSearch} // Gọi handleSearch khi tìm kiếm
              onSelect={(value) => test(value)} // Gọi handleSearch khi chọn gợi ý
              placeholder='Nhập từ cần tra cứu...'
              options={searchResults?.suggestions?.map((suggestion) => renderOption(suggestion)) || []}
              notFoundContent={searchResults && !loading ? <Text>Không có gợi ý từ.</Text> : null}
            ></AutoComplete>
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size='large' />
              </div>
            )}
          </Space>
          {content && (
            <div className='wrapper'>
              <div className='details' id='result'>
                Đang tải dữ liệu...
              </div>
            </div>
          )}
        </Card>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <BookOutlined />
          Từ điển của tôi
        </span>
      ),
      children: (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={mockCourses}
          renderItem={(course) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Button type='primary' icon={<StarOutlined />}>
                    Đăng Ký
                  </Button>
                ]}
              >
                <Card.Meta
                  title={course.title}
                  description={
                    <Space direction='vertical'>
                      <Text>{course.description}</Text>
                      <Space>
                        <Tag color='blue'>
                          <GlobalOutlined /> {course.level}
                        </Tag>
                        <Tag color='green'>{course.duration}</Tag>
                        <Tag color='purple'>{course.lessons} bài học</Tag>
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )
    }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  )
}

export default DictionaryPage
