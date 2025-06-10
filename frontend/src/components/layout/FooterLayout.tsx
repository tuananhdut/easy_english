import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

const FooterLayout: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#fff' }}>
      Easy English ©{new Date().getFullYear()} - Học tiếng anh là dễ
    </Footer>
  )
}

export default FooterLayout
