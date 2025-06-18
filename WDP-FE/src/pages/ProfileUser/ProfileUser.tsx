import Cookies from 'js-cookie'
import { Card, Descriptions, Avatar, Typography, Button, Layout } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import HeaderCus from '../../components/layout/Header/HeaderCus'

const { Title } = Typography
const { Content } = Layout

interface DecodedToken {
  name?: string
  email?: string
  phoneNumber?: string
  gender?: boolean
  role?: string
  exp?: number
  [key: string]: any
}

export default function ProfileUser() {
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

  //   const items: MenuProps['items'] = [
  //     {
  //       key: 'profile',
  //       label: 'Thông tin cá nhân',
  //     },
  //     {
  //       key: 'create-testee',
  //       label: 'Tạo người test ADN',
  //       onClick: () => navigate('/create-testee'),
  //     },
  //   ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
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
      </Header> */}
      <HeaderCus />

      <Content style={{ padding: '40px 24px' }}>
        <Card
          style={{
            maxWidth: 600,
            margin: 'auto',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Avatar size={80} icon={<UserOutlined />} />
            <Title level={3} style={{ marginTop: 12 }}>
              {decoded.name || 'Không rõ tên'}
            </Title>
            <div style={{ fontSize: 14, color: '#888' }}>
              {decoded.role || 'Vai trò'}
            </div>
          </div>

          <Descriptions column={1} bordered>
            <Descriptions.Item label='Email'>
              <MailOutlined /> {decoded.email}
            </Descriptions.Item>
            <Descriptions.Item label='Số điện thoại'>
              <PhoneOutlined /> {decoded.phoneNumber || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label='Giới tính'>
              {decoded.gender === true ? (
                <>
                  <ManOutlined /> Nam
                </>
              ) : decoded.gender === false ? (
                <>
                  <WomanOutlined /> Nữ
                </>
              ) : (
                'Chưa rõ'
              )}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type='primary' onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  )
}
