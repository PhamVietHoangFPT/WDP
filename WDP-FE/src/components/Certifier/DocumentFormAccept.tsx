import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  Typography,
  Spin,
  Card,
  Descriptions,
  Row,
  Col,
  Input,
  Button,
  message,
} from 'antd'
import Cookies from 'js-cookie'
import {
  useGetAdnDocumentationByServiceCaseIdQuery,
  useCreateCertifierResultMutation,
} from '../../features/certifier/certifierApi'
import { jwtDecode } from 'jwt-decode'

const { Title } = Typography
const { TextArea } = Input

interface DecodedToken {
  _id: string
  role: string
  // các field khác nếu cần
}

export default function DocumentFormAccept() {
  const { serviceCaseId } = useParams()
  const location = useLocation()
  const serviceCase = location.state?.serviceCase

  const [adnPercentage, setAdnPercentage] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [createResult, { isLoading: isSubmitting }] =
    useCreateCertifierResultMutation()

  const {
    data: documentation,
    isLoading,
    refetch,
  } = useGetAdnDocumentationByServiceCaseIdQuery(serviceCaseId!, {
    skip: !serviceCaseId,
  })

  useEffect(() => {
    if (serviceCaseId) refetch()
  }, [serviceCaseId])

  const profiles = documentation?.data?.[0]?.profiles || []

  const handleSubmit = async () => {
    if (!adnPercentage || !conclusion || !serviceCaseId) {
      return message.warning(
        'Vui lòng nhập đầy đủ thông tin trước khi gửi kết quả'
      )
    }

    try {
      const token = Cookies.get('userToken')
      if (!token) return message.error('Không tìm thấy token đăng nhập')

      const decoded = jwtDecode(token) as DecodedToken
      const certifierId = decoded.id

      const requestData = {
        adnPercentage,
        conclusion,
        serviceCase: serviceCaseId,
        certifierId,
      }

      console.log('📤 Dữ liệu gửi đi:', requestData) // 👈 log tại đây

      await createResult(requestData).unwrap()

      message.success('Tạo kết quả thành công')
    } catch (err) {
      console.error('❌ Tạo kết quả lỗi:', err) // 👈 log lỗi nếu có
      message.error('Tạo kết quả thất bại')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🧬 Kết quả phân tích ADN</Title>

      {isLoading ? (
        <Spin />
      ) : profiles.length > 0 ? (
        <Row gutter={[24, 24]}>
          {profiles.map((profile: any, index: number) => (
            <Col key={index} span={12}>
              <Card title={`🧪 ${profile.sampleIdentifyNumber}`} bordered>
                <Descriptions
                  bordered
                  column={1}
                  size='small'
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  {profile.markers.map((marker: any, idx: number) => (
                    <Descriptions.Item key={idx} label={marker.locus}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '4px',
                        }}
                      >
                        <input
                          value={marker.alleles[0] || ''}
                          disabled
                          style={{
                            width: '80%',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            padding: '4px 8px',
                          }}
                        />
                        <input
                          value={marker.alleles[1] || ''}
                          disabled
                          style={{
                            width: '80%',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            padding: '4px 8px',
                          }}
                        />
                      </div>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            </Col>
          ))}

          <Col span={24}>
            <Card title='📝 Nhập kết quả giám định'>
              <Input
                addonBefore='% trùng khớp'
                value={adnPercentage}
                onChange={(e) => setAdnPercentage(e.target.value)}
                placeholder='Ví dụ: 99.999'
              />
              <TextArea
                style={{ marginTop: 12 }}
                rows={4}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder='Nhập ghi chú/kết luận'
              />
              <Button
                type='primary'
                loading={isSubmitting}
                onClick={handleSubmit}
                style={{ marginTop: 12 }}
              >
                Gửi kết quả
              </Button>
            </Card>
          </Col>
        </Row>
      ) : (
        <div>Không tìm thấy dữ liệu ADN cho hồ sơ này.</div>
      )}
    </div>
  )
}
