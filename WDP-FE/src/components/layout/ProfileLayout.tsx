// src/layouts/ProfileLayout.jsx

import { Outlet, useNavigate } from 'react-router-dom'
import { Layout } from 'antd'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import AppHeader from './Header/Header'
import AppFooter from './Footer/Footer'
import HeaderCus from './Header/HeaderCus'
import Navbar from './Navbar/Navbar'

const { Content } = Layout

function ProfileLayout() {
  const navigate = useNavigate()

  // Giữ lại logic kiểm tra thông tin người dùng
  const userData = Cookies.get('userData')
    ? JSON.parse(Cookies.get('userData') as string)
    : null

  useEffect(() => {
    if (userData) {
      if (userData.Role === 'Customer') {
        if (!userData?.PhoneNumber || !userData?.Address) {
          navigate('/force-update')
        }
      }
    }
  }, [userData, navigate])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <AppHeader />
      <Layout>
        {/* === Thay đổi chính ở đây === */}
        <HeaderCus />
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff', // Thêm nền trắng cho khu vực nội dung
              borderRadius: '8px',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
        {/* ============================ */}
      </Layout>
      <AppFooter />
    </Layout>
  )
}

export default ProfileLayout
