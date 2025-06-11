import React, { useMemo, useState, useEffect } from 'react'
import { Menu, Button, Avatar, Dropdown, Drawer, Space, Typography, Spin } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  MessageOutlined,
  LogoutOutlined,
  MenuOutlined,
  TranslationOutlined,
  SettingOutlined,
  ProfileOutlined,
  FireOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { statisticsConsecutiveDays } from '../../features/statistics/statisticsApi'
import { message } from 'antd'
import { logout } from '../../features/auth/authSlice'

// Define prop types
interface HeaderProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [loadingStats, setLoadingStats] = useState(false)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchConsecutiveDays = async () => {
      try {
        setLoadingStats(true)
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
        setLoadingStats(false)
      }
    }

    fetchConsecutiveDays()
  }, [])

  // Define menu items for navigation
  const menuItems = useMemo(
    () => [
      {
        key: '1',
        icon: <HomeOutlined />,
        label: 'Trang chủ',
        path: '/dashboard'
      },
      {
        key: '2',
        icon: <TranslationOutlined />,
        label: 'Phiên dịch',
        path: '/dashboard/search'
      },
      {
        key: '3',
        icon: <BookOutlined />,
        label: 'Từ điển',
        path: '/dashboard/dictionary'
      },
      {
        key: '4',
        icon: <MessageOutlined />,
        label: 'Luyện nói',
        path: '/dashboard/practice'
      }
    ],
    []
  )

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/login')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      message.error('Đăng xuất thất bại')
    }
  }

  // Define dropdown menu for user info
  const userMenu = (
    <Menu
      style={{
        minWidth: '200px',
        padding: '8px 0'
      }}
    >
      <Menu.Item key='0' disabled style={{ cursor: 'default', height: 'auto' }}>
        <Space direction='vertical' size={0} style={{ width: '100%' }}>
          <Typography.Text strong style={{ fontSize: '16px', display: 'block' }}>
            {user?.fullName}
          </Typography.Text>
          <Typography.Text type='secondary' style={{ fontSize: '14px' }}>
            {user?.email}
          </Typography.Text>
        </Space>
      </Menu.Item>
      <Menu.Divider style={{ margin: '8px 0' }} />
      <Menu.Item
        key='1'
        icon={<ProfileOutlined />}
        onClick={() => navigate('/dashboard/profile')}
        style={{ padding: '8px 16px' }}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item
        key='2'
        icon={<SettingOutlined />}
        onClick={() => navigate('/dashboard/settings')}
        style={{ padding: '8px 16px' }}
      >
        Cài đặt
      </Menu.Item>
      <Menu.Divider style={{ margin: '8px 0' }} />
      <Menu.Item
        key='3'
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ padding: '8px 16px', color: '#ff4d4f' }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  // Determine the selected menu key based on the current route
  const selectedKey =
    menuItems.find(
      (item) => location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard')
    )?.key || '1'

  // Handle menu item click for navigation
  const handleMenuClick = ({ key }: { key: string }) => {
    const selectedItem = menuItems.find((item) => item.key === key)
    if (selectedItem?.path) {
      navigate(selectedItem.path)
      setDrawerVisible(false)
    }
  }

  return (
    <header
      style={{
        padding: 0,
        background: '#001529',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
        position: 'sticky',
        top: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transition: 'width 0.2s',
          background: '#001529',
          height: '64px',
          paddingLeft: isMobile ? '8px' : '16px'
        }}
      >
        {!isMobile && (
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: 'white',
              fontSize: '16px',
              marginRight: '16px'
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
        )}
      </div>

      {isMobile ? (
        <div
          style={{
            flex: 1,
            background: '#001529',
            height: '64px',
            lineHeight: '64px',
            borderRight: 'none'
          }}
        >
          <Button
            type='text'
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              color: 'white',
              fontSize: '16px',
              marginLeft: '8px'
            }}
          />
          <Drawer
            title='Menu'
            placement='left'
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={250}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              theme='dark'
              mode='inline'
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ height: '100%', borderRight: 0 }}
            />
          </Drawer>
        </div>
      ) : (
        <Menu
          theme='dark'
          mode='horizontal'
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            background: '#001529',
            height: '64px',
            lineHeight: '64px',
            borderRight: 'none'
          }}
        />
      )}

      <div
        style={{
          paddingRight: isMobile ? '8px' : '24px',
          display: 'flex',
          alignItems: 'center',
          background: '#001529',
          height: '64px'
        }}
      >
        {loadingStats ? (
          <Spin size='small' style={{ marginRight: '16px' }} />
        ) : (
          <Space style={{ marginRight: isMobile ? '8px' : '16px', color: 'white' }}>
            <FireOutlined style={{ color: '#faad14' }} />
            <Typography.Text style={{ color: 'white' }}>{consecutiveDays} ngày</Typography.Text>
          </Space>
        )}
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Avatar
            style={{
              marginLeft: isMobile ? '8px' : '16px',
              backgroundColor: '#1890ff',
              cursor: 'pointer'
            }}
            src={user?.image}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
