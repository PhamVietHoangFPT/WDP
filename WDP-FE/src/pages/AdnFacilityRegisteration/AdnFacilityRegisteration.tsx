import { Layout } from 'antd'
import type React from 'react'
import AdnRegisteration from '../../components/AdnRegisteration/AdnRegisteration'
const { Content } = Layout
const AdnFacilityRegisteration: React.FC = () => {
  return (
    <Layout>
      <Content>
        <AdnRegisteration />
      </Content>
    </Layout>
  )
}
export default AdnFacilityRegisteration
