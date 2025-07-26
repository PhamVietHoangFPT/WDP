import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './Header/Header'
import AppFooter from './Footer/Footer'
import HeaderCus from './Header/HeaderCus'
import Navbar from './Navbar/Navbar'

const { Content } = Layout

function ProfileLayout() {
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
