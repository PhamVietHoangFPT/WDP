import React from 'react'
import { Row, Col, Button, Typography } from 'antd'
import Logo from '../../assets/Logo.png'
import { CalendarOutlined, LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Introduction from '../Introduction/introduction'
import type { Service } from '../../types/service'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import ServiceCardSlider from '../ServiceSlider/serviceSlider'

interface ServiceListResponse {
  data: {
    data: Service[]
  }
  isLoading: boolean
}

const Homepage: React.FC = () => {
  const { data, isLoading } = useGetServiceListQuery<ServiceListResponse>({
    pageNumber: 1,
    pageSize: 5,
  })
  const dataService = data.data
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
          {isLoading ? (
            <LoadingOutlined
              style={{
                fontSize: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '30vh',
              }}
            />
          ) : (
            <ServiceCardSlider services={dataService || []} />
          )}
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
