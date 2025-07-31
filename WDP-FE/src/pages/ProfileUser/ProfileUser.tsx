import Cookies from 'js-cookie'
import {
  Card,
  Form,
  Input,
  Avatar,
  Typography,
  Button,
  Layout,
  Row,
  Col,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { EditOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Content } = Layout

interface DecodedToken {
  name?: string
  email?: string
  phoneNumber?: string
  gender?: boolean
  role?: string
  exp?: number
  [key: string]: unknown
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

  return (
    <Layout>
      <Content style={{ padding: '40px 24px' }}>
        <Card
          title={
            <span style={{ fontWeight: 'bold' }}>👤 Thông tin cá nhân</span>
          }
          style={{
            maxWidth: 800,
            margin: 'auto',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 24,
              position: 'relative',
            }}
          >
            <Avatar
              size={96}
              src='https://tse1.explicit.bing.net/th/id/OIP.lvzPu-WOW4Iv7QyjP-IkrgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
              style={{ border: '2px solid #d9d9d9' }}
            />
            <EditOutlined
              style={{
                position: 'absolute',
                right: 'calc(50% - 48px)',
                top: '70px',
                background: '#fff',
                padding: 6,
                borderRadius: '50%',
                boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
            />
          </div>

          <Form layout='vertical'>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label='Họ và Tên' name='username'>
                  <Input
                    placeholder='Username'
                    defaultValue={decoded.name}
                    readOnly
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label='Số điện thoại' name='phoneNumber'>
                  <Input
                    placeholder='Mobile No'
                    defaultValue={decoded.phoneNumber}
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='Email' name='email'>
                  <Input
                    placeholder='Email'
                    defaultValue={decoded.email}
                    readOnly
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right' }}>
              <Button type='primary' onClick={() => navigate('/edit-profile')}>
                Chỉnh sửa thông tin:
              </Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}
