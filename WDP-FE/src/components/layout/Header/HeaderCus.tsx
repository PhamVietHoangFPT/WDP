import { Button, Card, Menu, Typography, type MenuProps } from 'antd'
import { Header } from 'antd/es/layout/layout'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const { Title } = Typography

interface DecodedToken {
  name?: string
  email?: string
  phoneNumber?: string
  gender?: boolean
  role?: string
  exp?: number
  [key: string]: any
}

export default function HeaderCus() {
  const navigate = useNavigate()
  const token = Cookies.get('userToken')

  if (!token) {
    return (
      <Card style={{ maxWidth: 500, margin: '50px auto', textAlign: 'center' }}>
        <Title level={4}>Bạn chưa đăng nhập</Title>
        <Button type='primary' onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </Button>
      </Card>
    )
  }

  let decoded: DecodedToken
  try {
    decoded = jwtDecode<DecodedToken>(token)
  } catch (err) {
    return (
      <Card style={{ maxWidth: 500, margin: '50px auto', textAlign: 'center' }}>
        <Title level={4}>Token không hợp lệ</Title>
        <Button type='primary' onClick={() => navigate('/login')}>
          Đăng nhập lại
        </Button>
      </Card>
    )
  }
  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'create-testee',
      label: 'Tạo người test ADN',
      onClick: () => navigate('/create-testee'),
    },
    {
      key: 'list-testee',
      label: 'Danh sách người test ADN',
      onClick: () => navigate('/list-testee?pageNumber=1&pageSize=10'),
    },
    {
      key: 'payment-history',
      label: 'Lịch sử thanh toán',
      onClick: () => navigate('/payment-history?pageNumber=1&pageSize=5'),
    },
    {
      key: 'service-case-customer',
      label: 'Lịch sử trường hợp dịch vụ',
      onClick: () => navigate('/service-case-customer?pageNumber=1&pageSize=5'),
    },
  ]
  return (
    <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
      <div
        style={{
          float: 'left',
          marginRight: 30,
          fontWeight: 'bold',
          fontSize: 18,
        }}
      >
        👤 Khách hàng: {decoded.name}
      </div>
      <Menu mode='horizontal' items={items} style={{ lineHeight: '64px' }} />
    </Header>
  )
}
