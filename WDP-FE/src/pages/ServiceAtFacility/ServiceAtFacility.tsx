import { Layout } from 'antd'
import type React from 'react'
import ServiceAtFacilityForm from '../../components/AdnRegisteration/ServiceAtFacility'
const { Content } = Layout
const ServiceAtFacility: React.FC = () => {
  return (
    <Layout>
      <Content>
        <ServiceAtFacilityForm />
      </Content>
    </Layout>
  )
}
export default ServiceAtFacility
