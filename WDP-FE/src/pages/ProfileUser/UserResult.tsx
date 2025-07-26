import { useParams } from 'react-router-dom'
import { useGetResultByIdQuery } from '../../features/doctor/doctorAPI'
import {
  Spin,
  Alert,
  Typography,
  Card,
  Descriptions,
  Statistic,
  Result,
  Row,
  Col,
} from 'antd'
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export default function UserResult() {
  const { resultId } = useParams<{ resultId: string }>()

  const {
    data: resultData,
    isLoading,
    isError,
    error,
  } = useGetResultByIdQuery(resultId ?? '', {
    skip: !resultId,
  })

  // 1. Trạng thái đang tải
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spin size='large' />
      </div>
    )
  }

  // 2. Trạng thái lỗi
  if (isError) {
    return (
      <div style={{ padding: '50px 20px' }}>
        <Alert
          message='Lỗi'
          description='Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.'
          type='error'
          showIcon
        />
      </div>
    )
  }

  // 3. Trạng thái không tìm thấy kết quả
  if (!resultData) {
    return (
      <Result
        status='404'
        title='404'
        subTitle='Xin lỗi, chúng tôi không tìm thấy kết quả xét nghiệm này.'
      />
    )
  }

  // 4. Hiển thị kết quả thành công
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Kết quả xét nghiệm ADN
      </Title>

      <Card
        bordered={false}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Row align='middle' gutter={[16, 24]}>
          <Col xs={24} md={12}>
            <Statistic
              title='Tỷ lệ ADN trùng khớp'
              value={resultData.adnPercentage}
              precision={2}
              prefix={<CheckCircleOutlined />}
              suffix='%'
              valueStyle={{ color: '#3f8600', fontSize: '2.5rem' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Paragraph style={{ textAlign: 'right', fontStyle: 'italic' }}>
              Mã kết quả: <Text code>{resultData._id}</Text>
            </Paragraph>
          </Col>
        </Row>

        <Descriptions bordered column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label='Kết luận' labelStyle={{ width: '150px' }}>
            <Text strong style={{ color: '#1677ff', fontSize: '1.1rem' }}>
              {resultData.conclusion}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item label='Bác sĩ phụ trách'>
            <UserOutlined style={{ marginRight: 8 }} />
            {/* Sửa lại: Truy cập vào thuộc tính .name của object doctorId */}
            {resultData.doctorId?.name || 'Chưa cập nhật'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
