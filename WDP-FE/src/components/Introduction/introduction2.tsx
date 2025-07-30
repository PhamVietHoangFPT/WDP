import React from 'react'
import { Typography, Button } from 'antd'

const { Title, Paragraph } = Typography

const bannerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '500px',
  backgroundImage:
    'url("https://thumbs.dreamstime.com/z/molecule-dna-system-science-medicine-concepts-109603024.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const overlayStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '800px',
  textAlign: 'center',
}

const DNAInfoBanner: React.FC = () => {
  return (
    <div style={bannerStyle}>
      <div style={overlayStyle}>
        <Title level={2} style={{ color: '#fff' }}>
          DỊCH VỤ XÉT NGHIỆM ADN CHÍNH XÁC & BẢO MẬT
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#f0f0f0' }}>
          Chúng tôi cung cấp dịch vụ xét nghiệm ADN hàng đầu Việt Nam với độ
          chính xác cao, thời gian trả kết quả nhanh chóng và đảm bảo bảo mật
          tuyệt đối thông tin cá nhân.
        </Paragraph>
        <Paragraph style={{ fontSize: '16px', color: '#f0f0f0' }}>
          Được thực hiện bởi đội ngũ chuyên gia di truyền học giàu kinh nghiệm,
          ứng dụng công nghệ giải trình tự gen tiên tiến hàng đầu thế giới.
        </Paragraph>
        <Button type='primary'>Tìm hiểu thêm</Button>
      </div>
    </div>
  )
}

export default DNAInfoBanner
