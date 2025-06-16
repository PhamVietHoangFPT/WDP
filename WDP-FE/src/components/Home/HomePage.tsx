import React from 'react'
import { Row, Col, Button, Typography } from 'antd'
import { CalendarOutlined, LoadingOutlined } from '@ant-design/icons'
import Logo from '../../assets/Logo.png'
import { useNavigate } from 'react-router-dom'
import Introduction from '../Introduction/introduction'

const { Title, Paragraph } = Typography

const Homepage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div
      style={{
        background: '#f0f2f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '80%',
          padding: '24px',
          margin: '0 auto',
        }}
      >
        {/* Gioi thieu */}
        <Row gutter={[24, 24]} align='middle' style={{ marginBottom: '48px' }}>
          <Col xs={24} md={12}>
            <Introduction />
          </Col>
          <Col xs={24} md={12}>
            <img
              src={Logo || '/placeholder.svg'}
              alt=''
              style={{
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />

            <Button
              type='primary'
              size='large'
              icon={<CalendarOutlined />}
              onClick={() => {
                navigate('login')
              }}
            >
              Login
            </Button>
          </Col>
        </Row>

        {/* Danh sach dich vu */}
        <div style={{ marginBottom: '48px' }}>
          <Title
            level={2}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            Một số loại vaccine
          </Title>

          <LoadingOutlined
            style={{
              fontSize: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '30vh',
            }}
          />
        </div>
        {/* Danh sach blog */}
        <div style={{ marginBottom: '48px' }}>
          <Title
            level={2}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            Các bài viết mới
          </Title>

          <LoadingOutlined
            style={{
              fontSize: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '30vh',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Homepage
