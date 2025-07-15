import React from 'react'
import './serviceSlider.css'
import type { Service } from '../../types/service'
import { Card, Carousel } from 'antd'
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
interface ServiceCardSliderProps {
  services: Service[]
}

const ServiceCardSlider: React.FC<ServiceCardSliderProps> = ({ services }) => {
  return (
    <Carousel
      autoplay
      dots
      style={{ padding: '16px 0' }}
      slidesToShow={Math.min(services.length, 3)}
      responsive={[
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
          },
        },
      ]}
    >
      {services.map((service) => (
        <div key={service._id}>
          <Card
            hoverable
            style={{
              margin: '0 8px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
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
                    <p style={{ fontStyle: 'italic', fontSize: '10px' }}>
                      Hành chính <CheckCircleOutlined />
                    </p>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '10px' }}>
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
                  <p style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
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
          </Card>
        </div>
      ))}
    </Carousel>
  )
}

export default ServiceCardSlider
