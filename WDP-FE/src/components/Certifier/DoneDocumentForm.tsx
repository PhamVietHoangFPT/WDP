import React, { useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Typography, Spin, Card, Descriptions, Row, Col, Button } from 'antd'
import html2pdf from 'html2pdf.js'
import {
  useGetAdnDocumentationByServiceCaseIdQuery,
  useGetResultForCustomerQuery,
} from '../../features/certifier/certifierApi'

const { Title } = Typography

export default function DoneDocumentForm() {
  const { serviceCaseId } = useParams()
  const location = useLocation()
  const serviceCase = location.state?.serviceCase
  const pdfRef = useRef(null)

  const {
    data: documentation,
    isLoading: isLoadingDoc,
    refetch: refetchDoc,
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
    if (serviceCaseId) refetchDoc()
    if (resultId) refetchResult()
  }, [serviceCaseId, resultId])

  const profiles = documentation?.data?.[0]?.profiles || []
  const result = resultData

  const exportPDF = () => {
    if (!pdfRef.current) return
    setTimeout(() => {
      html2pdf()
        .from(pdfRef.current)
        .set({
          margin: 10,
          filename: 'adn-result.pdf',
          html2canvas: {
            scale: 3,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowHeight: document.body.scrollHeight + 500,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .save()
    }, 300)
  }
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🧬 Kết quả giám định ADN</Title>

      {isLoadingDoc || isLoadingResult ? (
        <Spin />
      ) : (
        <div ref={pdfRef}>
          <Row gutter={[24, 24]}>
            {profiles.map((profile: any, index: number) => (
              <Col key={index} span={12}>
                <div style={{ pageBreakInside: 'avoid' }}>
                  <Card
                    style={{
                      pageBreakInside: 'avoid',
                      border: '1px solid red',

                      breakInside: 'avoid', // cho trình duyệt mới
                      marginBottom: 16, // cách đều tránh chạm nhau gây lỗi
                    }}
                    title={`🧪 ${profile.sampleIdentifyNumber}`}
                    bordered
                  >
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
                                // width: '80%',
                                // border: '1px solid #d9d9d9',
                                // borderRadius: 4,
                                // padding: '4px 8px',
                                minWidth: '60px',
                                height: '28px',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: '14px',
                              }}
                            />
                            <input
                              value={marker.alleles[1] || ''}
                              disabled
                              style={{
                                // width: '80%',
                                // border: '1px solid #d9d9d9',
                                // borderRadius: 4,
                                // padding: '4px 8px',
                                minWidth: '60px',
                                height: '28px',
                                border: '1px solid #d9d9d9',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: '14px',
                              }}
                            />
                          </div>
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Card>
                </div>
              </Col>
            ))}

            <Col span={24}>
              <Card
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid', // cho trình duyệt mới
                  marginBottom: 16, // cách đều tránh chạm nhau gây lỗi
                }}
                title='📋 Kết luận giám định'
              >
                <p>
                  <strong>% trùng khớp:</strong>{' '}
                  {result?.adnPercentage ?? 'Không có dữ liệu'}
                </p>
                <p>
                  <strong>Ghi chú:</strong>{' '}
                  {result?.conclusion ?? 'Không có dữ liệu'}
                </p>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid', // cho trình duyệt mới
                  marginBottom: 16, // cách đều tránh chạm nhau gây lỗi
                }}
                title='👤 Thông tin người xét nghiệm'
              >
                {serviceCase?.caseMember?.testTakers.map(
                  (taker: any, index: number) => (
                    <p key={index}>
                      <strong>Người {index + 1}:</strong> {taker.name} | ID:{' '}
                      {taker.personalId} | Ngày sinh:{' '}
                      {new Date(taker.dateOfBirth).toLocaleDateString()} | Giới
                      tính: {taker.gender ? 'Nam' : 'Nữ'}
                    </p>
                  )
                )}
              </Card>
            </Col>

            <Col span={24}>
              <Card
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid', // cho trình duyệt mới
                  marginBottom: 16, // cách đều tránh chạm nhau gây lỗi
                }}
                title='🧑‍⚕️ Bác sĩ thực hiện'
              >
                <p>
                  <strong>Tên:</strong> {serviceCase?.doctorDetails?.name}
                </p>
                <p>
                  <strong>Email:</strong> {serviceCase?.doctorDetails?.email}
                </p>
                <p>
                  <strong>SĐT:</strong>{' '}
                  {serviceCase?.doctorDetails?.phoneNumber}
                </p>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid', // cho trình duyệt mới
                  marginBottom: 16, // cách đều tránh chạm nhau gây lỗi
                }}
                title='📜 Điều khoản dịch vụ'
              >
                <ul>
                  <li>
                    Kết quả chỉ có giá trị trong phạm vi hợp đồng xét nghiệm
                    giữa hai bên.
                  </li>
                  <li>
                    Không sử dụng cho mục đích pháp lý nếu không có xác nhận của
                    tổ chức có thẩm quyền.
                  </li>
                  <li>
                    Thông tin bảo mật, không chia sẻ nếu không có sự đồng ý của
                    bên yêu cầu.
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Button type='primary' danger onClick={exportPDF}>
          📄 Xuất kết quả PDF
        </Button>
      </div>
    </div>
  )
}
