import { Space, Typography } from 'antd'
import React from 'react'
const { Title, Paragraph } = Typography
const Introduction: React.FC = () => {
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
      </Space>
    </div>
  )
}

export default Introduction
