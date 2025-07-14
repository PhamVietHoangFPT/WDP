import React from 'react'
import { Card, Row, Col, Button, Spin } from 'antd'
import type { Service } from '../../types/service'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import './AtHomeRegisteration.css'
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
interface ServiceListResponse {
  data: {
    data: Service[]
  }
  isLoading: boolean
}

const AtHomeRegisteration: React.FC = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useGetServiceListQuery<ServiceListResponse>({
    pageNumber: 1,
    pageSize: 5,
  })
  const dataService = data?.data || []
  const handleRegisterClick = (serviceId: string) => {
    navigate(`/register-service-at-home/${serviceId}`)
  }
  return (
    <>
      {/* Title Section */}
      <div className='title-section'>
        <h1>DỊCH VỤ CỦA CHÚNG TÔI</h1>
        <p>Tổng hợp thông tin Dịch vụ</p>
        <span className='dna-icon'>🧬</span>
      </div>

      {/* Service Cards */}
      <div className='service-container'>
        {isLoading ? (
          <Spin
            size='large'
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px',
            }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {dataService
              .filter((service) => !service.isAdministration)
              .map((service) => (
                <Col key={service._id} xs={24} sm={12} md={8}>
                  <Card hoverable className='service-card'>
                    <Card.Meta
                      title={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <p style={{ color: '#1565C0' }}>
                            Mẫu xét nghiệm: {service.sample.name}
                          </p>
                          {service.isAdministration ? (
                            <p
                              style={{ fontStyle: 'italic', fontSize: '10px' }}
                            >
                              Hành chính <CheckCircleOutlined />
                            </p>
                          ) : (
                            <p
                              style={{ fontStyle: 'italic', fontSize: '10px' }}
                            >
                              Dân sự <UserOutlined />
                            </p>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ color: 'black' }}>
                            Xét nghiệm huyết thống bên{' '}
                            {service.isAgnate ? 'nội' : 'ngoại'}
                          </p>
                          <p
                            style={{ fontWeight: 'bold', fontStyle: 'italic' }}
                          >
                            Giá:{' '}
                            {service.fee &&
                            service.timeReturn &&
                            service.timeReturn.timeReturnFee &&
                            service.sample.fee
                              ? (
                                  service.fee +
                                  service.timeReturn.timeReturnFee +
                                  service.sample.fee
                                ).toLocaleString('vi-VN') + '₫'
                              : 'Contact for pricing'}
                          </p>
                        </div>
                      }
                    />
                    <div style={{ marginTop: '10px' }}>
                      <Button
                        type='primary'
                        className='register-button'
                        style={{ marginRight: '8px' }}
                        onClick={() => handleRegisterClick(service._id)}
                      >
                        Đăng ký
                      </Button>
                      <Button type='default' className='detail-button'>
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
          </Row>
        )}
      </div>
    </>
  )
}

export default AtHomeRegisteration
