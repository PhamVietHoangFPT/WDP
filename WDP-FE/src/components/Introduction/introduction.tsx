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
        Bảo vệ bạn và những người thân yêu bằng tiêm chủng
      </Title>
      <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
        Tiêm chủng là một trong những cách hiệu quả nhất để phòng ngừa bệnh tật.
        Hãy tiêm chủng ngay hôm nay để bảo vệ bản thân và giúp xây dựng miễn
        dịch cộng đồng.
      </Paragraph>
      <Space>
        <Button
          type='primary'
          size='large'
          icon={<CalendarOutlined />}
          onClick={() => {
            navigate('vaccine-registration')
          }}
        >
          Đặt lịch hẹn
        </Button>
      </Space>
    </div>
  )
}

export default Introduction
