import { Button, Space, Typography } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarOutlined } from '@ant-design/icons'
const { Title, Paragraph } = Typography

const Introduction: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '0 16px' }}>
      <Title level={1} style={{ marginBottom: '24px', color: '#1890ff' }}>
        Xét nghiêm ADN hàng đầu Việt Nam, uy tín, chất lượng, đảm bảo an toàn
        thông tin
      </Title>
      <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
        Chúng tôi có các y, bác sĩ có chuyên môn cao. Hỗ trợ nhanh chóng, có kết
        quả nhanh, hỗ trợ trực tiếp tại nhà.
      </Paragraph>
      <Space>
        <Button
          type='primary'
          size='large'
          icon={<CalendarOutlined />}
          onClick={() => {
            navigate('booking')
          }}
        >
          Đặt lịch hẹn
        </Button>
      </Space>
    </div>
  )
}

export default Introduction
