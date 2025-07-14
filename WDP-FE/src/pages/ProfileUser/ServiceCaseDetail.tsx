import { Card, Typography, Timeline, Spin, Button } from 'antd'
import { useParams } from 'react-router-dom'
import { useGetTestRequestHistoryQuery } from '../../features/customer/paymentApi'
import Cookies from 'js-cookie'

const { Title, Text } = Typography

export default function ServiceCaseDetail() {
  const { id } = useParams() // serviceCaseId
  const userData = Cookies.get('userData')

  let accountId = ''
  try {
    accountId = userData ? JSON.parse(userData).id : ''
  } catch (error) {
    console.error('Failed to parse userData cookie:', error)
  }

  const { data, isLoading } = useGetTestRequestHistoryQuery({
    accountId,
    serviceCaseId: id,
  })

  const sortedData = [...(data?.data || [])].sort(
    (a, b) => a.testRequestStatus.order - b.testRequestStatus.order
  )

  return (
    <div>
      <Card style={{ margin: '30px auto', maxWidth: 800 }}>
        <Title level={3} style={{paddingBottom: '30px'}}>Trạng thái hồ sơ</Title>
        {isLoading ? (
          <Spin />
        ) : (
          <Timeline mode="left">
            {sortedData.map((item, index) => (
              <Timeline.Item
                key={item._id}
                color={index === sortedData.length - 1 ? 'green' : 'blue'}
              >
                <Text strong>
                  {new Date(item.created_at).toLocaleString('vi-VN')}
                </Text>
                <br />
                <Text>{item.testRequestStatus.testRequestStatus}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => window.history.back()}>
          Trở về
        </Button>
      </Card>
    </div>
  )
}
