import React from 'react'
import { Layout } from 'antd'
import Homepage from '../../components/Home/HomePage'
import Introduction from '../../components/Introduction/introduction'

const { Content } = Layout

const Home: React.FC = () => {
  return (
    <Layout>
      <Content>
        <Homepage />
      </Content>
    </Layout>
  )
}

export default Home
