import React from 'react'
import { Layout, Menu, Button, Avatar, Card, Row, Col } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  SearchOutlined,
  BookOutlined,
  MessageOutlined
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout

const Dashboard = () => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Combined Header and Horizontal Sider */}
      <Header
        style={{
          padding: 0,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1
        }}
      >
        {/* Combined Logo and Collapse Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: collapsed ? '80px' : '200px',
            transition: 'width 0.2s',
            background: '#001529',
            height: '64px',
            paddingLeft: '16px'
          }}
        >
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: 'white',
              fontSize: '16px',
              marginRight: '16px'
            }}
          />
          {!collapsed && <h2 style={{ color: 'white', margin: 0 }}>Dashboard</h2>}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={['1']}
          style={{
            flex: 1,
            background: '#001529',
            height: '64px',
            lineHeight: '64px',
            borderRight: 'none'
          }}
        >
          <Menu.Item key='1' icon={<HomeOutlined />}>
            {!collapsed && 'Trang chủ'}
          </Menu.Item>
          <Menu.Item key='2' icon={<SearchOutlined />}>
            {!collapsed && 'Tra cứu'}
          </Menu.Item>
          <Menu.Item key='3' icon={<BookOutlined />}>
            {' '}
            {/* Thay bằng icon quyển sách phù hợp hơn cho từ điển */}
            {!collapsed && 'Từ điển'}
          </Menu.Item>
          <Menu.Item key='4' icon={<MessageOutlined />}>
            {' '}
            {/* Thay bằng icon tin nhắn/hội thoại cho luyện nói */}
            {!collapsed && 'Luyện nói'}
          </Menu.Item>
        </Menu>

        {/* Right side buttons */}
        <div
          style={{
            paddingRight: '24px',
            display: 'flex',
            alignItems: 'center',
            background: '#001529', // Thêm background trùng với menu
            height: '64px' // Đảm bảo chiều cao bằng với menu
          }}
        >
          <Avatar
            style={{
              marginLeft: '16px',
              backgroundColor: '#1890ff',
              cursor: 'pointer'
            }}
            icon={<UserOutlined />}
          />
        </div>
      </Header>

      {/* Main Content */}
      <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title='Tổng quan' bordered={false}>
              <p>Nội dung thống kê 1</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card title='Hoạt động' bordered={false}>
              <p>Nội dung thống kê 2</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card title='Thông báo' bordered={false}>
              <p>Nội dung thống kê 3</p>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title='Báo cáo chi tiết' bordered={false}>
              <p>Nội dung báo cáo chi tiết</p>
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center' }}>
        Dashboard ©{new Date().getFullYear()} - Được tạo bởi Ant Design và React
      </Footer>
    </Layout>
  )
}

export default Dashboard
