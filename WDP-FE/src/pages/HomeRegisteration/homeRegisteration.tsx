import { Layout } from "antd";
import type React from "react";
import AtHomeRegisteration from "../../components/HomeRegisteration/atHomeRegisteration";
const { Content } = Layout
const HomeRegisteration: React.FC = () => {
    return (
        <Layout>
            <Content>
                <AtHomeRegisteration />
            </Content>
        </Layout>
    )
}
export default HomeRegisteration