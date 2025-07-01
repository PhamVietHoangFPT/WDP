import { Layout } from 'antd'
import type React from 'react'
import ServiceAtHomeForm from '../../components/ServiceAtHome/serviceAtHome'
const { Content } = Layout
const ServiceAtHome: React.FC = () => {
  return (
    <Layout>
      <Content>
        <ServiceAtHomeForm />
      </Content>
    </Layout>
  )
}
export default ServiceAtHome
