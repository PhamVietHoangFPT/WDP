import React from 'react'
import { Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Logo from '../../assets/Logo.png'
import Content from '../Content/content'
import Introduction from '../Introduction/introduction'
const Homepage: React.FC = () => {
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
          </Col>
        </Row>

        {/* Danh sach dich vu */}
        <div style={{ marginBottom: '48px' }}>
          <Content
            title='CÁC DỊCH VỤ'
            btnContent='Xem tất cả dịch vụ'
            linkURL='/sessions'
          />
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
          <Content
            title='CÁC BÀI VIẾT MỚI'
            btnContent='Xem tất cả bài viết'
            linkURL='/sessions'
          />
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
