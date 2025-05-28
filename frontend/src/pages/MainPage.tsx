import React, { useState, useEffect, useRef } from 'react'
import { Layout, Button, Space, Typography, Card, Row, Col, Avatar, Progress, Radio, Spin } from 'antd'
import { UserOutlined, FireOutlined, BookOutlined } from '@ant-design/icons'
import Chart from 'chart.js/auto'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import {
  statisticsConsecutiveDays,
  statisticsLearning,
  statisticsMonthlyLearning
} from '../features/statistics/statisticsApi'
import { IStatisticsData } from '../features/statistics/statisticsType'
import { message } from 'antd'

const { Content } = Layout
const { Title, Text } = Typography

const MainPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<IStatisticsData[]>([])
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [todayProgress, setTodayProgress] = useState(0)
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAppSelector((state) => state.auth)

  // Mock data - replace with real data from API
  const userStats = {
    totalWords: 150,
    learnedWords: 120,
    dailyGoal: 10
  }

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = timeRange === 'week' ? await statisticsLearning() : await statisticsMonthlyLearning()

      if (response.status === 'success') {
        setStatistics(response.data)
        if (timeRange === 'week') {
          setTodayProgress(response.data[6].count)
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      message.error('Không thể tải dữ liệu thống kê')
    } finally {
      setLoading(false)
    }
  }

  const fetchConsecutiveDays = async () => {
    try {
      setLoading(true)
      const response = await statisticsConsecutiveDays()
      if (response.status === 'success') {
        setConsecutiveDays(response.data.consecutiveDays)
      } else {
        setConsecutiveDays(0)
      }
    } catch (error) {
      console.error('Error fetching consecutive days:', error)
      message.error('Không thể tải dữ liệu chuỗi ngày học')
      setConsecutiveDays(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
    fetchConsecutiveDays()
  }, [timeRange])

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
                backgroundColor: 'rgba(24, 144, 255, 0.8)',
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
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  stepSize: 1
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }
    }
  }, [statistics, timeRange])

  if (authLoading || loading) {
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
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                <Space>
                  <Button type='primary' size='large'>
                    Tiếp tục học
                  </Button>
                  <Button
                    type='primary'
                    icon={<BookOutlined />}
                    size='large'
                    onClick={() => navigate('/create-dictionary')}
                  >
                    Tạo từ điển
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Learning Stats */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={12}>
              <Card>
                <Space direction='vertical' style={{ width: '100%' }}>
                  <Space align='center'>
                    <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>
                      Tiến độ học tập
                    </Title>
                  </Space>
                  <div style={{ marginTop: '16px' }}>
                    <Space direction='vertical' style={{ width: '100%' }}>
                      <Row justify='space-between'>
                        <Text>Từ vựng đã học</Text>
                        <Text strong>
                          {userStats.learnedWords}/{userStats.totalWords}
                        </Text>
                      </Row>
                      <Progress
                        percent={Math.round((userStats.learnedWords / userStats.totalWords) * 100)}
                        status='active'
                      />
                    </Space>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <Space direction='vertical' style={{ width: '100%' }}>
                      <Row justify='space-between'>
                        <Text>Mục tiêu hôm nay</Text>
                        <Text strong>
                          {todayProgress}/{userStats.dailyGoal} từ
                        </Text>
                      </Row>
                      <Progress
                        percent={Math.round((todayProgress / userStats.dailyGoal) * 100)}
                        status='active'
                        strokeColor='#52c41a'
                      />
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Space direction='vertical' style={{ width: '100%' }}>
                  <Space align='center'>
                    <FireOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                    <Title level={4} style={{ margin: 0 }}>
                      Chuỗi ngày học
                    </Title>
                  </Space>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                      borderRadius: '8px',
                      marginTop: '16px'
                    }}
                  >
                    <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                      {consecutiveDays}
                    </Title>
                    <Text strong>Ngày liên tiếp</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text type='secondary'>Tiếp tục duy trì để nhận thưởng!</Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Card title='Hoạt động gần đây'>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card size='small' title='Từ vựng mới'>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text>Bạn đã học {todayProgress} từ mới hôm nay</Text>
                    <Button type='link'>Xem chi tiết</Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size='small' title='Luyện tập'>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text>Hoàn thành 3 bài luyện tập</Text>
                    <Button type='link'>Xem chi tiết</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Learning Statistics Chart */}
          <Card
            title='Thống kê học tập'
            style={{ marginTop: '24px' }}
            extra={
              <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <Radio.Button value='week'>Theo tuần</Radio.Button>
                <Radio.Button value='month'>Theo tháng</Radio.Button>
              </Radio.Group>
            }
          >
            <div
              style={{
                width: '100%',
                height: window.innerWidth < 768 ? 200 : 300,
                overflowX: 'auto'
              }}
            >
              <canvas ref={chartRef} />
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default MainPage
