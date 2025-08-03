import React from 'react'
import { Card, Typography } from 'antd'
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

interface Facility {
  _id: string
  facilityName: string
  phoneNumber: string
  address: {
    fullAddress: string
    location: {
      type: string
      coordinates: [number, number] // [longitude, latitude]
    }
  }
}

interface FacilityCardSliderProps {
  facilities: Facility[]
}

const FacilityCardSlider: React.FC<FacilityCardSliderProps> = ({
  facilities,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        overflowX: 'auto',
        padding: '8px',
      }}
    >
      {facilities.map((facility) => (
        <Card
          key={facility._id}
          title={
            <Text strong ellipsis={{ tooltip: facility.facilityName }}>
              {facility.facilityName}
            </Text>
          }
          style={{
            minWidth: 300,
            maxWidth: 350,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          bodyStyle={{ padding: 16 }}
        >
          {/* Google Maps Embed */}
          {facility.address?.location?.coordinates?.length === 2 ? (
            <iframe
              src={`https://maps.google.com/maps?q=${facility.address.location.coordinates[1]},${facility.address.location.coordinates[0]}&z=15&output=embed`}
              width='100%'
              height='180'
              style={{ border: 0, borderRadius: 8, marginBottom: 12 }}
              loading='lazy'
              title={`Google Map for ${facility.facilityName}`}
            ></iframe>
          ) : (
            <Paragraph type='secondary' italic>
              Không có vị trí bản đồ.
            </Paragraph>
          )}

          {/* Địa chỉ */}
          <Paragraph style={{ marginBottom: 8 }}>
            <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            {facility.address.fullAddress}
          </Paragraph>

          {/* Số điện thoại */}
          <Paragraph style={{ marginBottom: 0 }}>
            <PhoneOutlined style={{ marginRight: 8, color: '#faad14' }} />
            {facility.phoneNumber}
          </Paragraph>
        </Card>
      ))}
    </div>
  )
}

export default FacilityCardSlider
