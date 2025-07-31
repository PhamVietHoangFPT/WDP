import React from 'react'
import { Row, Col } from 'antd'

interface ServiceItem {
  title: string
  image: string
  link: string
}

const services: ServiceItem[] = [
  {
    title: 'Xét nghiệm tại trung tâm',
    image:
      'https://images.emojiterra.com/google/noto-emoji/unicode-16.0/bw/1024px/1f9ec.png',
    link: '/adminstrative-services',
  },
  {
    title: 'Xét nghiệm tại nhà',
    image:
      'https://img.freepik.com/premium-vector/spiral-dna-molecule-monochrome-silhouette-icon_71609-5599.jpg',
    link: '/home-registeration',
  },
  {
    title: 'Xét nghiệm theo yêu cầu',
    image:
      'https://static.vecteezy.com/system/resources/previews/020/429/702/non_2x/adn-flat-accounting-logo-design-on-white-background-adn-creative-initials-growth-graph-letter-logo-concept-adn-business-finance-logo-design-vector.jpg',
    link: '/home-registeration',
  },
  {
    title: 'Chứng chỉ công nhận ADN',
    image: 'https://vnvc.vn/wp-content/uploads/2025/02/tiem-chung-vip.png',
    link: '/',
  },
]

const ServicesSection: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'rgba(4, 65, 122, 1)', padding: '60px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <h2
          style={{
            fontSize: '36px',
            textAlign: 'center',
            color: '#ffffff',
            marginBottom: '40px',
          }}
        >
          CÁC DỊCH VỤ CỦA CHÚNG TÔI
        </h2>
        <Row gutter={[24, 24]} justify='center'>
          {services.map((service, index) => (
            <Col xs={12} sm={8} md={6} key={index}>
              <a
                href={service.link}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  display: 'block',
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '25px 15px',
                  textAlign: 'center',
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s',
                }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  height={100}
                  style={{ objectFit: 'contain' }}
                />
                <div
                  style={{
                    marginTop: '15px',
                    fontWeight: 600,
                    color: '#333',
                    textTransform: 'uppercase',
                    lineHeight: '1.4',
                  }}
                >
                  {service.title}
                </div>
              </a>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default ServicesSection
