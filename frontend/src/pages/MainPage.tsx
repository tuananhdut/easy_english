import React, { useState, useEffect, useRef } from 'react'
import { Layout, Button, Space, Typography, Card, Row, Col, Avatar, Spin, List, Radio } from 'antd'
import { UserOutlined, BookOutlined } from '@ant-design/icons'
import Chart from 'chart.js/auto'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { statisticsLearning, statisticsMonthlyLearning } from '../features/statistics/statisticsApi'
import { IStatisticsData } from '../features/statistics/statisticsType'
import { message } from 'antd'

interface ICollection {
  id: string
  name: string
  wordCount: number
}

const { Content } = Layout
const { Title, Text } = Typography

const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAppSelector((state) => state.auth)

  const [recentCollections, setRecentCollections] = useState<ICollection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(false)

  // Add state for statistics and time range
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [statistics, setStatistics] = useState<IStatisticsData[]>([])
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    const fetchRecentCollections = async () => {
      setLoadingCollections(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRecentCollections([
        { id: '1', name: 'Toeic Vocabulary', wordCount: 500 },
        { id: '2', name: 'IELTS Essential Words', wordCount: 300 },
        { id: '3', name: 'Common English Phrases', wordCount: 200 }
      ])
      setLoadingCollections(false)
    }
    fetchRecentCollections()
  }, [])
  const fetchStatistics = async () => {
    try {
      setLoadingStats(true)
      const response = timeRange === 'week' ? await statisticsLearning() : await statisticsMonthlyLearning()

      if (response.status === 'success') {
        setStatistics(response.data)
      } else {
        setStatistics([])
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      message.error('Không thể tải dữ liệu thống kê')
      setStatistics([])
    } finally {
      setLoadingStats(false)
    }
  }
  // Effect to fetch statistics data
  useEffect(() => {
    fetchStatistics()
  }, [])

  // Effect to render chart
  useEffect(() => {
    if (chartRef.current && statistics.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        // Format dates for display
        const labels = statistics.map((item) => {
          const date = new Date(item.date)
          return timeRange === 'week'
            ? date.toLocaleDateString('vi-VN', { weekday: 'short' })
            : date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
        })

        const data = statistics.map((item) => item.count)

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Số từ đã học',
                data: data,
                backgroundColor: 'rgba(24, 144, 255, 0.9)',
                borderColor: '#1890ff',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: timeRange === 'week' ? 30 : 20
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 10,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 4,
                displayColors: false,
                callbacks: {
                  title: (items) => {
                    const index = items[0].dataIndex
                    const date = new Date(statistics[index].date)
                    return timeRange === 'week'
                      ? date.toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
                  },
                  label: (items) => {
                    return `Số từ: ${items.formattedValue}`
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                  stepSize: 1,
                  color: '#555'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#555'
                }
              }
            }
          }
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [statistics, timeRange])

  if (authLoading || loadingCollections) {
    // Update loading check
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content
          style={{
            padding: '24px',
            background: '#f0f2f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Spin size='large' />
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '12px', background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
            {/* Left Column for Welcome and Statistics */}
            <Col xs={24} lg={16}>
              {/* Welcome Section */}
              <Card style={{ marginBottom: '24px' }}>
                <Row align='middle' gutter={24}>
                  <Col>
                    <Avatar size={64} src={user?.image} icon={!user?.image && <UserOutlined />} />
                  </Col>
                  <Col flex='auto'>
                    <Title level={4} style={{ margin: 0 }}>
                      Xin chào, {user?.fullName || 'Người dùng'}
                    </Title>
                    <Text type='secondary'>Hãy tiếp tục học tập để cải thiện kỹ năng của bạn</Text>
                  </Col>
                  <Col>
                    <Button
                      type='primary'
                      icon={<BookOutlined />}
                      size='large'
                      onClick={() => navigate('/create-dictionary')}
                    >
                      Tạo từ điển
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Learning Statistics Chart */}
              <Card
                title='Thống kê học tập'
                style={{ marginBottom: '24px' }}
                extra={
                  <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}>
                    <Radio.Button value='week'>Theo tuần</Radio.Button>
                    <Radio.Button value='month'>Theo tháng</Radio.Button>
                  </Radio.Group>
                }
              >
                {loadingStats ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Spin size='large' />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: window.innerWidth < 768 ? 200 : 300,
                      overflowX: 'auto'
                    }}
                  >
                    <canvas ref={chartRef} />
                  </div>
                )}
              </Card>
            </Col>

            {/* Right Column for Collections and Activity */}
            <Col xs={24} lg={8}>
              {/* Recent Collections */}
              <Card
                title={
                  <Space align='center'>
                    <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>
                      Bộ sưu tập gần đây
                    </Title>
                  </Space>
                }
                style={{ marginBottom: '24px' }}
              >
                {loadingCollections ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Spin size='large' />
                  </div>
                ) : (
                  <List
                    dataSource={recentCollections}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button type='primary' onClick={() => navigate(`/study/${item.id}`)}>
                            Học ngay
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={<Text strong>{item.name}</Text>}
                          description={<Text type='secondary'>{item.wordCount} từ</Text>}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              {/* Recent Activity */}
              <Card title='Hoạt động gần đây'>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Card size='small' title='Từ vựng mới'>
                      <Space direction='vertical' style={{ width: '100%' }}>
                        <Text>Bạn đã học X từ mới hôm nay</Text>
                        <Button type='link'>Xem chi tiết</Button>
                      </Space>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size='small' title='Luyện tập'>
                      <Space direction='vertical' style={{ width: '100%' }}>
                        <Text>Hoàn thành 3 bài luyện tập</Text>
                        <Button type='link'>Xem chi tiết</Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  )
}

export default MainPage
