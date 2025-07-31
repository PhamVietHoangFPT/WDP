import React from 'react'
import { Carousel } from 'antd'

const bannerImages = [
  'https://thumbs.dreamstime.com/z/dna-spiral-d-polygonal-website-template-science-design-illustration-concept-low-poly-genetic-helix-symbol-homepage-promotion-255742043.jpg',
  'https://www.shutterstock.com/shutterstock/photos/1791472793/display_1500/stock-vector-dna-research-vector-background-futuristic-medicine-genome-helix-1791472793.jpg',
]

const contentStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
  objectFit: 'cover',
}

const Introduction: React.FC = () => {
  return (
    <div style={{ padding: '0 16px' }}>
      <Carousel autoplay>
        {bannerImages.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`banner-${index}`} style={contentStyle} />
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Introduction
