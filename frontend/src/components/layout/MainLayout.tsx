import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  console.log('MainLayout')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Thanh navigation cố định */}
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Nội dung động của các page */}
      <main style={{ flex: 1, padding: '16px', background: '#f0f2f5' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
