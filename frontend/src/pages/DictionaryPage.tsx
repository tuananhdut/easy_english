import React, { useState } from 'react'
import { Input, Card, Tabs, Typography, Space, Button, List, Tag, Spin, message } from 'antd'
import { SearchOutlined, BookOutlined, StarOutlined, GlobalOutlined } from '@ant-design/icons'
import { searchDictionaryApi } from '../features/dictionary/dictionaryApi'
import { DictionaryApiResponse } from '../features/dictionary/dictionarytypes'

const { Title, Text } = Typography

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

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setSearchResults(null)
      return
    }

    try {
      setLoading(true)
      const results = await searchDictionaryApi({ query: value })
      console.log(results)

      setSearchResults(results)
    } catch (error) {
      message.error('Không thể tìm kiếm từ điển. Vui lòng thử lại sau.')
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <Input
              size='large'
              placeholder='Nhập từ cần tra cứu...'
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size='large' />
              </div>
            )}
            {searchResults && !loading && (
              <Card>
                <Title level={4}>Kết quả tra cứu cho "{searchTerm}"</Title>
                {searchResults.suggestions && searchResults.suggestions.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Gợi ý từ:</Text>
                    <Space wrap style={{ marginTop: '8px' }}>
                      {searchResults.suggestions.map((suggestion, index) => (
                        <Tag
                          key={index}
                          color='blue'
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSearch(suggestion)}
                        >
                          {suggestion}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
                {searchResults.data && searchResults.data.length > 0 ? (
                  searchResults.data.map((item, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {item.word}
                      </Text>
                      {item.pronunciation && (
                        <Text type='secondary' style={{ marginLeft: '8px' }}>
                          [{item.pronunciation}]
                        </Text>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <Text>{item.meaning}</Text>
                      </div>
                      {item.examples && item.examples.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <Text strong>Ví dụ:</Text>
                          <ul style={{ marginTop: '4px' }}>
                            {item.examples.map((example, idx) => (
                              <li key={idx}>
                                <Text>{example}</Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <Text>Không tìm thấy kết quả phù hợp.</Text>
                )}
              </Card>
            )}
          </Space>
        </Card>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <BookOutlined />
          Khóa Học
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
      <Title level={2} style={{ marginBottom: '24px', color: '#1890ff' }}>
        <BookOutlined /> Từ Điển & Khóa Học
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  )
}

export default DictionaryPage
