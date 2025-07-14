import { Outlet } from 'react-router-dom'
import { Layout, Typography } from 'antd'
import {} from '@ant-design/icons'
import { SideBar } from './SideBarAdmin/SideBarAdmin'
// import Cookies from 'js-cookie'
// import { useEffect } from 'react'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

export const AdminLayout = () => {
  //   const navigate = useNavigate()

  //   useEffect(() => {
  //     // Get userData from cookies and parse it
  //     const userDataString = Cookies.get('userData')

  //     if (!userDataString) {
  //       navigate('/')
  //       return
  //     }

  //     let userData
  //     try {
  //       userData = JSON.parse(userDataString)
  //     } catch (error) {
  //       console.error('Failed to parse userData from cookies:', error)
  //       navigate('/')
  //       return
  //     }

  //     if (userData.Role !== 'Manager') {
  //       navigate('/')
  //     }
  //   }, [navigate])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBar />
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            zIndex: 1,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Quản Lý Tiêm Chủng
          </Title>
        </Header>

        <Content style={{ margin: '24px' }}>
          <div
            style={{
              padding: 24,
              background: '#fff',
              borderRadius: 6,
              minHeight: 280,
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>
          <Text type='secondary'>
            © 2025 GeneXis Admin Portal. All rights reserved.
          </Text>
        </Footer>
      </Layout>
    </Layout>
  )
}
