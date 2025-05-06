import React, { useMemo, useState, useEffect } from 'react'
import { Menu, Button, Avatar, Dropdown, Drawer } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  MessageOutlined,
  LogoutOutlined,
  MenuOutlined,
  TranslationOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

// Define prop types
interface HeaderProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mock user data (replace with real user data from auth context or API)
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  }

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

  // Define dropdown menu for user info
  const userMenu = (
    <Menu>
      <Menu.Item key='0' disabled>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 16px' }}>
          <span style={{ fontWeight: 'bold' }}>{user.name}</span>
          <span style={{ color: '#888' }}>{user.email}</span>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key='1' icon={<LogoutOutlined />} onClick={() => navigate('/login')}>
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
        zIndex: 1,
        position: 'sticky',
        top: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: collapsed ? '80px' : isMobile ? '0' : '200px',
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
        {!collapsed && !isMobile && <h2 style={{ color: 'white', margin: 0 }}>Dashboard</h2>}
      </div>

      {isMobile ? (
        <>
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
        </>
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
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Avatar
            style={{
              marginLeft: isMobile ? '8px' : '16px',
              backgroundColor: '#1890ff',
              cursor: 'pointer'
            }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
