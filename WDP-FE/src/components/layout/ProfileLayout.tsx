import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './Header/Header'
import AppFooter from './Footer/Footer'
import HeaderCus from './Header/HeaderCus'
import Navbar from './Navbar/Navbar'

const { Content, Sider } = Layout

function ProfileLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <AppHeader />

      {/* Phần chính của trang */}
      <Layout style={{ background: '#f5f5f5' }}>
        {/* === Sidebar bên trái === */}
        <Sider
          width={350}
          style={{
            background: '#fff',
            padding: '24px 0 0 24px',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <HeaderCus />
        </Sider>

        {/* === Nội dung chính === */}
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '8px',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <AppFooter />
    </Layout>
  )
}

export default ProfileLayout
