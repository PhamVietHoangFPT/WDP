import React, { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Typography, Spin, Card, Descriptions, Row, Col } from 'antd'
import {
  useGetAdnDocumentationByServiceCaseIdQuery,
  useGetResultForCustomerQuery,
} from '../../features/certifier/certifierApi'

const { Title } = Typography

export default function DoneDocumentForm() {
  const { serviceCaseId } = useParams()
  const location = useLocation()
  const serviceCase = location.state?.serviceCase

  const {
    data: documentation,
    isLoading: isLoadingDoc,
    refetch,
  } = useGetAdnDocumentationByServiceCaseIdQuery(serviceCaseId!, {
    skip: !serviceCaseId,
  })

  const resultId = serviceCase?.result
  const {
    data: resultData,
    isLoading: isLoadingResult,
    refetch: refetchResult,
  } = useGetResultForCustomerQuery(resultId, {
    skip: !resultId,
  })

  useEffect(() => {
    if (serviceCaseId) refetch()
    if (resultId) refetchResult()
  }, [serviceCaseId, resultId])

  const profiles = documentation?.data?.[0]?.profiles || []
  const result = resultData?.data

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🧬 Kết quả giám định ADN</Title>

      {isLoadingDoc || isLoadingResult ? (
        <Spin />
      ) : (
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
                            width: '100%',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            padding: '4px 8px',
                          }}
                        />
                        <input
                          value={marker.alleles[1] || ''}
                          disabled
                          style={{
                            width: '100%',
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
            <Card title='📋 Kết luận giám định'>
              <p>
                <strong>% trùng khớp:</strong>{' '}
                {result?.adnPercentage || 'Không có dữ liệu'}
              </p>
              <p>
                <strong>Ghi chú:</strong>{' '}
                {result?.conclusion || 'Không có dữ liệu'}
              </p>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
