import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../app/store'
import { me } from '../../features/auth/authSlice'
import Header from './Header'
import FooterLayout from './FooterLayout'
import { Spin } from 'antd'

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!isAuthenticated && token) {
        await dispatch(me())
      }
      setAuthChecked(true)
    }

    checkAuth()
  }, [dispatch, isAuthenticated])

  if (!authChecked || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Nội dung động của các page */}
      <main style={{ flex: 1, padding: '16px', background: '#f0f2f5' }}>
        <Outlet />
      </main>
      <FooterLayout />
    </div>
  )
}

export default MainLayout
