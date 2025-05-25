import React, { useState, useEffect } from 'react'
import { AutoComplete, Card, Tabs, Typography, Space, List, message, Layout, Drawer } from 'antd'
import { SearchOutlined, BookOutlined } from '@ant-design/icons'
import { searchDictionaryApi } from '../features/dictionary/dictionaryApi'
import { DictionaryApiResponse, SearchDataDictionary, SearchParams } from '../features/dictionary/dictionarytypes'
import DictionaryResult from '../components/DictionaryResult'
import CollectionCard from '../components/collection/ColectionCard'
import { useNavigate } from 'react-router-dom'
import { getOwnCollections } from '../features/collecion/collectionApi'
import { ICollection } from '../features/collecion/collectionType'

const { Text, Title } = Typography

const DictionaryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(false)
  const [searchRecommend, setSearchRecommend] = useState<DictionaryApiResponse | null>(null)
  const [content, setContent] = useState(false)
  const [openedCollection, setOpenedCollection] = useState<ICollection | null>(null)
  const [collections, setCollections] = useState<ICollection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true)
      const response = await getOwnCollections()
      console.log(response)
      if (response.status === 'success' && response.data?.collections) {
        setCollections(response.data.collections)
      } else {
        setCollections([])
        message.error('Không thể lấy danh sách bộ sưu tập')
      }
    } catch (error) {
      setCollections([])
      message.error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập')
      console.error('Error fetching collections:', error)
    } finally {
      setLoadingCollections(false)
    }
  }

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
      setSearchRecommend(results.data)
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

  // CollectionDetail component
  const CollectionDetail = ({ collection }: { collection: ICollection }) => (
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
        <b>Ngày tạo:</b> {new Date(collection.created_at).toLocaleDateString()}
      </Text>
      <br />
      <Text>
        <b>Ngôn ngữ:</b> {collection.source_language} - {collection.target_language}
      </Text>
      <br />
      <Text>
        <b>Cấp độ:</b> {collection.level}
      </Text>
      <br />
      <Text>
        <b>Số thẻ:</b> {collection.total_flashcards}
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
            dataSource={collections || []}
            loading={loadingCollections}
            renderItem={(collection) => (
              <List.Item>
                <div style={{ cursor: 'pointer' }}>
                  <CollectionCard
                    collection={{
                      id: collection.id.toString(),
                      name: collection.name,
                      description: collection.description,
                      level: collection.level,
                      totalWords: collection.total_flashcards,
                      learnedWords: 0,
                      reviewWords: 0,
                      progress: 0,
                      createdAt: collection.created_at,
                      updatedAt: collection.updated_at,
                      userId: collection.owner.id.toString(),
                      isPublic: !collection.is_private,
                      category: 'Từ vựng',
                      tags: [],
                      owner: {
                        id: collection.owner.id.toString(),
                        name: collection.owner.fullName || collection.owner.email || 'Unknown'
                      }
                    }}
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
