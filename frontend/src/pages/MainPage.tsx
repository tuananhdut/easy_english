import React, { useState, useEffect, useRef } from 'react'
import { Layout, Button, Space, Typography, Card, Row, Col, Avatar, Progress, Radio } from 'antd'
import { UserOutlined, FireOutlined, BookOutlined } from '@ant-design/icons'
import Chart from 'chart.js/auto'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

const { Content } = Layout
const { Title, Text } = Typography

const MainPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  // Mock data - replace with real data from API
  const userStats = {
    totalWords: 150,
    learnedWords: 120,
    streakDays: 12,
    dailyGoal: 20,
    todayProgress: 15
  }

  // Mock data for charts
  const weeklyData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    data: [15, 20, 18, 25, 22, 30, 28]
  }

  const monthlyData = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    data: [120, 150, 180, 200]
  }

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const data = timeRange === 'week' ? weeklyData : monthlyData
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Số từ đã học',
                data: data.data,
                backgroundColor: 'rgba(24, 144, 255, 0.8)',
                borderColor: '#1890ff',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 30
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
                borderWidth: 1
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  stepSize: 20
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
  }, [timeRange])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Welcome Section */}
          <Card style={{ marginBottom: '24px' }}>
            <Row align='middle' gutter={24}>
              <Col>
                <Avatar size={64} src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
              </Col>
              <Col flex='auto'>
                <Title level={4} style={{ margin: 0 }}>
                  Xin chào, {user?.name || 'Người dùng'}
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
          <Row gutter={24} style={{ marginBottom: '24px' }}>
            <Col span={12}>
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
                          {userStats.todayProgress}/{userStats.dailyGoal} từ
                        </Text>
                      </Row>
                      <Progress
                        percent={Math.round((userStats.todayProgress / userStats.dailyGoal) * 100)}
                        status='active'
                        strokeColor='#52c41a'
                      />
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
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
                      {userStats.streakDays}
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
              <Col span={12}>
                <Card size='small' title='Từ vựng mới'>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <Text>Bạn đã học {userStats.todayProgress} từ mới hôm nay</Text>
                    <Button type='link'>Xem chi tiết</Button>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
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
            <div style={{ width: '100%', height: 300 }}>
              <canvas ref={chartRef} />
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default MainPage
