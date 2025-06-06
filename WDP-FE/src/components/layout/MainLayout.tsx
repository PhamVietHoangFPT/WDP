import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
const { Content } = Layout
import { useEffect } from 'react'
import AppFooter from './Footer/Footer'
import AppHeader from './Header/Header'

function MainLayout() {
  const navigate = useNavigate()

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
    <Layout
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppHeader />
      <Content
        style={{
          padding: '50px',
          paddingTop: '30px',
          overflow: 'initial',
          width: '100vw',
        }}
      >
        <Outlet />
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default MainLayout
