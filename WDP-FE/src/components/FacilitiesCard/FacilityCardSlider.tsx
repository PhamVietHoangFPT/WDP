import React from 'react'
import { Card, Carousel } from 'antd'
import type { Facility } from '../../types/facilities'
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons'

interface FacilityCardSliderProps {
  facilities: Facility[]
}

const FacilityCardSlider: React.FC<FacilityCardSliderProps> = ({
  facilities,
}) => {
  return (
    <Carousel
      autoplay
      dots
      style={{ padding: '16px 0' }}
      slidesToShow={Math.min(facilities.length, 4)}
      responsive={[
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
          },
        },
      ]}
    >
      {facilities.map((facility) => (
        <div key={facility._id}>
          <Card
            hoverable
            style={{
              margin: '0 8px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            cover={
              <img
                alt='facility'
                src='https://tse4.mm.bing.net/th/id/OIP.bmQljgLBVDgv1jz4pWuWhAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
                style={{
                  height: '150px',
                  objectFit: 'cover',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              />
            }
          >
            <Card.Meta
              title={
                <p
                  style={{
                    color: '#1565C0',
                    fontWeight: 'bold',
                    marginBottom: 4,
                  }}
                >
                  {facility.facilityName}
                </p>
              }
              description={
                <>
                  <p style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined />{' '}
                    {facility.address?.fullAddress || 'Không có địa chỉ'}
                  </p>
                  <p>
                    <PhoneOutlined />{' '}
                    {facility.phoneNumber || 'Chưa có số điện thoại'}
                  </p>
                </>
              }
            />
          </Card>
        </div>
      ))}
    </Carousel>
  )
}

export default FacilityCardSlider
