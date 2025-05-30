import React, { useState, useEffect } from 'react'
import {
  AutoComplete,
  Card,
  Typography,
  Space,
  List,
  message,
  Layout,
  Drawer,
  Row,
  Col,
  Input,
  Tabs,
  Select
} from 'antd'
import { SearchOutlined, BookOutlined, ShareAltOutlined } from '@ant-design/icons'
import { searchDictionaryApi } from '../features/dictionary/dictionaryApi'
import { DictionaryApiResponse, SearchDataDictionary, SearchParams } from '../features/dictionary/dictionarytypes'
import DictionaryResult from '../components/DictionaryResult'
import CollectionCard from '../components/collection/ColectionCard'
import { useNavigate } from 'react-router-dom'
import { getOwnCollections, getSharedCollections } from '../features/collecion/collectionApi'
import { ICollection } from '../features/collecion/collectionType'

const { Text, Title } = Typography
const { TabPane } = Tabs
const { Option } = Select

const DictionaryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchRecommend, setSearchRecommend] = useState<DictionaryApiResponse | null>(null)
  const [content, setContent] = useState(false)
  const [openedCollection, setOpenedCollection] = useState<ICollection | null>(null)
  const [collections, setCollections] = useState<ICollection[]>([])
  const [sharedCollections, setSharedCollections] = useState<ICollection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [loadingSharedCollections, setLoadingSharedCollections] = useState(false)
  const navigate = useNavigate()
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
  const [sharedCollectionSearchTerm, setSharedCollectionSearchTerm] = useState('')
  const [selectedLanguagePair, setSelectedLanguagePair] = useState('1')

  useEffect(() => {
    fetchCollections()
    fetchSharedCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true)
      const response = await getOwnCollections()
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

  const fetchSharedCollections = async () => {
    try {
      setLoadingSharedCollections(true)
      const response = await getSharedCollections()
      if (response.status === 'success' && response.data?.collections) {
        setSharedCollections(response.data.collections)
      } else {
        setSharedCollections([])
        message.error('Không thể lấy danh sách bộ sưu tập được chia sẻ')
      }
    } catch (error) {
      setSharedCollections([])
      message.error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập được chia sẻ')
      console.error('Error fetching shared collections:', error)
    } finally {
      setLoadingSharedCollections(false)
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
        type: Number(selectedLanguagePair),
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

  const handleStudy = (collectionId: number) => {
    try {
      navigate(`/study/${collectionId}`)
    } catch (error) {
      console.error('Error starting study session:', error)
      message.error('Có lỗi xảy ra khi bắt đầu phiên học')
    }
  }

  const handleReview = (collectionId: number) => {
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

  // Filter collections based on search term
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearchTerm.toLowerCase())
  )

  const filteredSharedCollections = sharedCollections.filter((collection) =>
    collection.name.toLowerCase().includes(sharedCollectionSearchTerm.toLowerCase())
  )

  return (
    <Layout style={{ background: 'transparent' }}>
      <div style={{ padding: '18px', margin: '0 auto', width: '100%' }}>
        <Row gutter={24}>
          {/* Collections Section (Left Col - 2/3)*/}
          <Col xs={24} md={16}>
            <Card>
              <Tabs defaultActiveKey='1'>
                <TabPane
                  tab={
                    <Space>
                      <BookOutlined />
                      Flashcard của tôi
                    </Space>
                  }
                  key='1'
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <Title level={4} style={{ margin: 0 }}>
                      Flashcard của tôi
                    </Title>
                    <Input.Search
                      placeholder='Tìm kiếm bộ sưu tập'
                      allowClear
                      onSearch={setCollectionSearchTerm}
                      onChange={(e) => setCollectionSearchTerm(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                    dataSource={filteredCollections}
                    loading={loadingCollections}
                    renderItem={(collection) => (
                      <List.Item>
                        <div style={{ cursor: 'pointer' }}>
                          <CollectionCard
                            collection={{
                              id: collection.id,
                              name: collection.name,
                              description: collection.description,
                              level: collection.level,
                              total_flashcards: collection.total_flashcards,
                              learnedWords: collection.learnedWords,
                              reviewWords: collection.reviewWords,
                              created_at: collection.created_at,
                              updated_at: collection.updated_at,
                              is_private: collection.is_private,
                              category: 'Từ vựng',
                              source_language: collection.source_language,
                              target_language: collection.target_language,
                              sharedUsersCount: 0,
                              owner: {
                                id: collection.owner.id,
                                fullName: collection.owner.fullName || collection.owner.email || 'Unknown',
                                email: collection.owner.email,
                                image: collection.owner.image
                              }
                            }}
                            type='owned'
                            onEdit={() => handleEdit(collection.id.toString())}
                            onStudy={handleStudy}
                            onReview={handleReview}
                            onCardClick={() => setOpenedCollection(collection)}
                          />
                        </div>
                      </List.Item>
                    )}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <Space>
                      <ShareAltOutlined />
                      Flashcard được chia sẻ
                    </Space>
                  }
                  key='2'
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}
                  >
                    <Title level={4} style={{ margin: 0 }}>
                      Flashcard được chia sẻ
                    </Title>
                    <Input.Search
                      placeholder='Tìm kiếm bộ sưu tập'
                      allowClear
                      onSearch={setSharedCollectionSearchTerm}
                      onChange={(e) => setSharedCollectionSearchTerm(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                    dataSource={filteredSharedCollections}
                    loading={loadingSharedCollections}
                    renderItem={(collection) => (
                      <List.Item>
                        <div style={{ cursor: 'pointer' }}>
                          <CollectionCard
                            collection={{
                              id: collection.id,
                              name: collection.name,
                              description: collection.description,
                              level: collection.level,
                              total_flashcards: collection.total_flashcards,
                              learnedWords: collection.learnedWords,
                              reviewWords: collection.reviewWords,
                              created_at: collection.created_at,
                              updated_at: collection.updated_at,
                              is_private: collection.is_private,
                              category: 'Từ vựng',
                              source_language: collection.source_language,
                              target_language: collection.target_language,
                              sharedUsersCount: 0,
                              owner: {
                                id: collection.owner.id,
                                fullName: collection.owner.fullName || collection.owner.email || 'Unknown',
                                email: collection.owner.email,
                                image: collection.owner.image
                              }
                            }}
                            type='sharedView'
                            onStudy={handleStudy}
                            onReview={handleReview}
                            onCardClick={() => setOpenedCollection(collection)}
                          />
                        </div>
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Tra Từ Điển Section (Right Col - 1/3)*/}
          <Col xs={24} md={8}>
            <Card style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>
                <SearchOutlined /> Tra Từ Điển
              </Title>
              <Input.Group compact>
                <AutoComplete
                  style={{ width: 'calc(100% - 120px)' }}
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                  onSearch={handleSearch}
                  onSelect={(value) => test(value)}
                  placeholder='Nhập từ cần tra cứu...'
                  options={searchRecommend?.suggestions?.map((suggestion) => renderOption(suggestion)) || []}
                  notFoundContent={searchRecommend && !loading ? <Text>Không có gợi ý từ.</Text> : null}
                  defaultActiveFirstOption={true}
                />
                <Select
                  value={selectedLanguagePair}
                  style={{ width: 120 }}
                  onChange={(value) => setSelectedLanguagePair(value)}
                >
                  <Option value='1'>Anh - Việt</Option>
                  <Option value='2'>Việt - Anh</Option>
                  <Option value='3'>Anh - Anh</Option>
                </Select>
              </Input.Group>
              {content && (
                <DictionaryResult searchText={encodeURIComponent(searchTerm)} type={Number(selectedLanguagePair)} />
              )}
            </Card>
          </Col>
        </Row>
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
