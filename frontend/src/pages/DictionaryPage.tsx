import React, { useState } from 'react'
import { AutoComplete, Card, Tabs, Typography, Space, List, message, Layout, Drawer } from 'antd'
import { SearchOutlined, BookOutlined } from '@ant-design/icons'
import { searchDictionaryApi } from '../features/dictionary/dictionaryApi'
import { DictionaryApiResponse, SearchDataDictionary, SearchParams } from '../features/dictionary/dictionarytypes'
import DictionaryResult from '../components/DictionaryResult'
import CollectionCard from '../components/ColectionCard'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography

// Mock data với các quyền truy cập khác nhau
const mockCollections = {
  owned: [
    {
      id: '1',
      name: 'Từ vựng tiếng Anh cơ bản',
      description: 'Bộ sưu tập từ vựng tiếng Anh cơ bản cho bắt đầu',
      level: 'Cơ bản',
      totalWords: 500,
      learnedWords: 150,
      reviewWords: 50,
      progress: 30,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
      userId: 'user1',
      isPublic: true,
      category: 'Từ vựng',
      tags: ['cơ bản', 'giao tiếp'],
      coverImage: 'https://example.com/basic-vocab.jpg',
      owner: {
        id: 'user1',
        name: 'Nguyễn Văn A'
      }
    }
  ],
  sharedView: [
    {
      id: '2',
      name: 'Từ vựng TOEIC',
      description: 'Bộ sưu tập từ vựng chuyên ngành TOEIC',
      level: 'Trung cấp',
      totalWords: 1000,
      learnedWords: 400,
      reviewWords: 100,
      progress: 40,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z',
      userId: 'user2',
      isPublic: true,
      category: 'TOEIC',
      tags: ['toeic', 'business'],
      owner: {
        id: 'user2',
        name: 'Trần Thị B'
      }
    }
  ],
  sharedEdit: [
    {
      id: '3',
      name: 'Từ vựng IELTS',
      description: 'Bộ sưu tập từ vựng nâng cao cho IELTS',
      level: 'Nâng cao',
      totalWords: 1500,
      learnedWords: 750,
      reviewWords: 200,
      progress: 50,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z',
      userId: 'user3',
      isPublic: true,
      category: 'IELTS',
      tags: ['ielts', 'academic', 'nâng cao'],
      coverImage: 'https://example.com/ielts-vocab.jpg',
      owner: {
        id: 'user3',
        name: 'Lê Văn C'
      }
    }
  ]
}

const DictionaryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(false)
  const [searchRecommend, setSearchRecommend] = useState<DictionaryApiResponse | null>(null)
  const [content, setContent] = useState(false)
  const [openedCollection, setOpenedCollection] = useState<import('../components/ColectionCard').Collection | null>(
    null
  )
  const navigate = useNavigate()

  const handleSearch = async (value: string) => {
    setContent(false)
    setSearchTerm(value)
    if (!value.trim()) {
      setSearchRecommend(null)
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
      setSearchRecommend(results)
    } catch (error) {
      message.error('Không thể tìm kiếm từ điển. Vui lòng thử lại sau.')
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const test = async (value: string) => {
    setContent(true)
    setSearchTerm(value)
  }

  const handleEdit = (collectionId: string) => {
    navigate(`/edit-collection/${collectionId}`)
  }

  const handleStudy = (collectionId: string) => {
    message.success(`Bắt đầu học bộ sưu tập ID: ${collectionId}`)
  }

  const handleReview = (collectionId: string) => {
    message.success(`Đánh giá bộ sưu tập ID: ${collectionId}`)
  }

  const renderOption = (suggestion: SearchDataDictionary) => ({
    value: suggestion.select,
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

  // Mock CollectionDetail component
  const CollectionDetail = ({ collection }: { collection: import('../components/ColectionCard').Collection }) => (
    <div style={{ padding: 24 }}>
      <Title level={4}>Chi tiết bộ sưu tập</Title>
      <Text>
        <b>Tên:</b> {collection.name}
      </Text>
      <br />
      <Text>
        <b>Mô tả:</b> {collection.description}
      </Text>
      <br />
      <Text>
        <b>Ngày tạo:</b> {new Date(collection.createdAt).toLocaleDateString()}
      </Text>
      <br />
      <Text>
        <b>Tags:</b>{' '}
        {collection.tags &&
          collection.tags.map((tag: string, idx: number) => (
            <span key={idx} style={{ marginRight: 8 }}>
              <span style={{ background: '#e6f7ff', padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
            </span>
          ))}
      </Text>
    </div>
  )

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
              onChange={(value) => handleSearch(value)}
              onSearch={handleSearch}
              onSelect={(value) => test(value)}
              placeholder='Nhập từ cần tra cứu...'
              options={searchRecommend?.suggestions?.map((suggestion) => renderOption(suggestion)) || []}
              notFoundContent={searchRecommend && !loading ? <Text>Không có gợi ý từ.</Text> : null}
              defaultActiveFirstOption={true}
            />
          </Space>
          {content && <DictionaryResult searchText={searchTerm} />}
        </Card>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <BookOutlined />
          Bộ sưu tập của tôi
        </span>
      ),
      children: (
        <Space direction='vertical' style={{ width: '100%' }}>
          <Title level={4}>Bộ sưu tập của tôi</Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={mockCollections.owned}
            renderItem={(collection) => (
              <List.Item>
                <div style={{ cursor: 'pointer' }}>
                  <CollectionCard
                    collection={collection}
                    type='owned'
                    onEdit={handleEdit}
                    onStudy={handleStudy}
                    onReview={handleReview}
                    onCardClick={() => setOpenedCollection(collection)}
                  />
                </div>
              </List.Item>
            )}
          />

          <Title level={4}>Được chia sẻ với tôi</Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={[...mockCollections.sharedView, ...mockCollections.sharedEdit]}
            renderItem={(collection) => {
              const type = mockCollections.sharedView.some((c) => c.id === collection.id) ? 'sharedView' : 'sharedEdit'
              return (
                <List.Item>
                  <div style={{ cursor: 'pointer' }}>
                    <CollectionCard
                      collection={collection}
                      type={type}
                      onEdit={handleEdit}
                      onStudy={handleStudy}
                      onReview={handleReview}
                      onCardClick={() => setOpenedCollection(collection)}
                    />
                  </div>
                </List.Item>
              )
            }}
          />
        </Space>
      )
    }
  ]

  return (
    <Layout style={{ background: 'transparent' }}>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
      </div>
      <Drawer
        title='Chi tiết bộ sưu tập'
        placement='right'
        width={400}
        open={!!openedCollection}
        onClose={() => setOpenedCollection(null)}
        destroyOnClose
      >
        {openedCollection && <CollectionDetail collection={openedCollection} />}
      </Drawer>
    </Layout>
  )
}

export default DictionaryPage
