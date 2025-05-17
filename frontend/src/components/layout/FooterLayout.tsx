import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

const FooterLayout: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#fff' }}>
      Từ Điển Pro ©{new Date().getFullYear()} - Phát triển bởi Tuấn Anh
    </Footer>
  )
}

export default FooterLayout
