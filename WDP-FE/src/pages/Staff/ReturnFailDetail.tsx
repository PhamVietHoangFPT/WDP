import {
  Card,
  Typography,
  Timeline,
  Spin,
  Button,
  Image,
  Space,
  Row,
  Col,
  Descriptions,
  Tag,
  Table,
  Divider,
} from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  useGetTestRequestHistoryQuery,
  useGetImageQuery,
  useGetServiceCaseByIdQuery,
} from '../../features/customer/paymentApi'
import { useState, useEffect, useRef } from 'react'
import { PhoneOutlined } from '@ant-design/icons'
import html2pdf from 'html2pdf.js'

const { Title, Text } = Typography

export default function ReturnFailDetail() {
  const { id } = useParams()
  const pdfRef = useRef(null)
  const [searchParams] = useSearchParams()

  const accountId = searchParams.get('accountId') || ''

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetTestRequestHistoryQuery({
      accountId,
      serviceCaseId: id,
    })

  const { data: serviceCaseData, isLoading: isLoadingServiceCase } =
    useGetServiceCaseByIdQuery(id as string, {
      skip: !id,
    })

  const { data: imageData, isLoading: isLoadingImages } = useGetImageQuery(
    id as string,
    {
      skip: !id,
    }
  )

  const [fullImageUrls, setFullImageUrls] = useState<string[]>([])

  useEffect(() => {
    if (imageData && imageData.length > 0) {
      const urls = imageData.map(
        (img: any) => `http://localhost:5000${img.url}`
      )
      setFullImageUrls(urls)
    } else {
      setFullImageUrls([])
    }
  }, [imageData])

  const sortedHistoryData = [...(historyData?.data || [])].sort(
    (a, b) => a.created_at - b.created_at
  )

  if (isLoadingHistory || isLoadingServiceCase) {
    return (
      <Spin tip='Đang tải...' style={{ display: 'block', marginTop: '50px' }} />
    )
  }

  const serviceCase = serviceCaseData

  const feeColumns = [
    {
      title: 'Chi phí dịch vụ',
      dataIndex: ['caseMember', 'service'],
      key: 'service',
      render: (services: any[]) => (
        <Space direction='vertical'>
          {services?.map((service, index) => (
            <Text key={index}>
              {service.name} ({service.sample.name})
            </Text>
          ))}
          <Text strong>Phí dịch vụ phát sinh:</Text>
          <Text strong>Tổng cộng:</Text>
        </Space>
      ),
    },
    {
      title: 'Số tiền (VNĐ)',
      dataIndex: ['caseMember', 'service'],
      key: 'fee',
      align: 'right' as const,
      render: (services: any[], record: any) => {
        const serviceTotal = services?.reduce((sum, s) => sum + s.fee, 0)
        const shippingFee = record?.shippingFee
        const total = serviceTotal + shippingFee
        return (
          <Space direction='vertical'>
            {services?.map((service, index) => (
              <Text key={index}>{service.fee.toLocaleString('vi-VN')} ₫</Text>
            ))}
            <Text>{shippingFee?.toLocaleString('vi-VN')} ₫</Text>
            <Divider style={{ margin: '4px 0' }} />
            <Text strong>{total.toLocaleString('vi-VN')} ₫</Text>
          </Space>
        )
      },
    },
  ]

  const exportPDF = () => {
    if (!pdfRef.current) return
    setTimeout(() => {
      html2pdf()
        .from(pdfRef.current)
        .set({
          margin: 10,
          filename: 'service-case.pdf',
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

  const markerColumns = [
    {
      title: 'Locus',
      dataIndex: 'locus',
      key: 'locus',
    },
    {
      title: 'Alleles',
      dataIndex: 'alleles',
      key: 'alleles',
      render: (alleles: string[]) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={alleles[0] || ''}
            disabled
            style={{
              minWidth: 60,
              height: 28,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              padding: '0 8px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          />
          <input
            value={alleles[1] || ''}
            disabled
            style={{
              minWidth: 60,
              height: 28,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              padding: '0 8px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Chi tiết hồ sơ dịch vụ</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card style={{ marginBottom: '20px' }}>
            <Title level={4}>Trạng thái hồ sơ</Title>
            {isLoadingHistory ? (
              <Spin />
            ) : (
              <Timeline mode='left'>
                {sortedHistoryData.map((item, index) => (
                  <Timeline.Item
                    key={item._id}
                    color={
                      index === sortedHistoryData.length - 1 ? 'green' : 'blue'
                    }
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
          </Card>
        </Col>
        <Col span={18}>
          <Card style={{ marginBottom: 16 }} ref={pdfRef}>
            <Title level={4}>Thông tin chung</Title>
            <Descriptions bordered size='small' column={1}>
              <Descriptions.Item label='Mã hồ sơ'>
                {serviceCase?._id}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày tạo'>
                {serviceCase?.created_at &&
                  new Date(serviceCase.created_at).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày đặt'>
                {serviceCase?.caseMember?.booking?.bookingDate &&
                  new Date(
                    serviceCase.caseMember.booking.bookingDate
                  ).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label='Thời gian lấy mẫu'>
                {serviceCase?.caseMember?.booking?.slot?.startTime} -{' '}
                {serviceCase?.caseMember?.booking?.slot?.endTime}
              </Descriptions.Item>
              <Descriptions.Item label='Cơ sở'>
                {
                  serviceCase?.caseMember?.booking?.slot?.slotTemplate?.facility
                    ?.facilityName
                }
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái hiện tại'>
                <Tag color='blue'>
                  {serviceCase?.currentStatus?.testRequestStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={4}>Thông tin khách hàng</Title>
            <Descriptions bordered size='small' column={1}>
              <Descriptions.Item label='Tên tài khoản'>
                {serviceCase?.account?.name}
              </Descriptions.Item>
              <Descriptions.Item label='Số điện thoại'>
                {serviceCase?.account?.phoneNumber}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={4}>Thông tin người xét nghiệm</Title>
            <Descriptions bordered size='small' column={1}>
              {serviceCase?.caseMember?.testTaker.map((taker: any) => (
                <Descriptions.Item key={taker._id} label='Họ và tên'>
                  {taker.name} (CMND/CCCD: {taker.personalId})
                </Descriptions.Item>
              ))}
            </Descriptions>
            <Divider />
            <Title level={4}>Dịch vụ đã chọn</Title>
            <Descriptions bordered size='small' column={1}>
              {serviceCase?.caseMember?.service.map((service: any) => (
                <Descriptions.Item key={service._id} label='Dịch vụ'>
                  {service.name} (Loại mẫu: {service.sample.name}) - Thời gian
                  trả kết quả: {service.timeReturn.timeReturn} ngày
                </Descriptions.Item>
              ))}
              <Descriptions.Item label='Hình thức lấy mẫu'>
                {serviceCase?.caseMember?.isAtHome ? (
                  <>
                    <Tag color='green'>Lấy mẫu tại nhà</Tag>
                    {serviceCase?.caseMember?.isSelfSampling ? (
                      <Tag color='purple'>Khách hàng tự lấy mẫu</Tag>
                    ) : (
                      <Tag color='blue'>Nhân viên đến lấy mẫu</Tag>
                    )}
                  </>
                ) : (
                  <Tag>Lấy mẫu tại trung tâm</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={4}>Chi phí</Title>
            <Table
              dataSource={[serviceCase]}
              columns={feeColumns}
              pagination={false}
              showHeader={false}
              style={{ marginBottom: 20 }}
            />
            {serviceCase?.condition && (
              <>
                <Text strong type='danger'>
                  Chi phí phát sinh:
                </Text>
                <Text type='danger'>
                  {' '}
                  {serviceCase.condition.toLocaleString('vi-VN')} ₫
                </Text>
              </>
            )}
            <Divider />
            <Title level={4}>Thông tin nhân sự</Title>
            <Descriptions bordered size='small' column={1}>
              <Descriptions.Item label='Nhân viên lấy mẫu'>
                {serviceCase?.sampleCollector ? (
                  <Space direction='vertical'>
                    <Text strong>{serviceCase.sampleCollector.name}</Text>
                    <Text type='secondary'>
                      <PhoneOutlined />{' '}
                      {serviceCase.sampleCollector.phoneNumber}
                    </Text>
                  </Space>
                ) : (
                  <Tag>Chưa chỉ định</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Bác sĩ phụ trách'>
                {serviceCase?.doctor ? (
                  <Space direction='vertical'>
                    <Text strong>{serviceCase.doctor.name}</Text>
                    <Text type='secondary'>
                      <PhoneOutlined /> {serviceCase.doctor.phoneNumber}
                    </Text>
                  </Space>
                ) : (
                  <Tag>Chưa chỉ định</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={4}>Kết quả xét nghiệm</Title>
            {serviceCase?.result ? (
              <>
                <Descriptions
                  bordered
                  size='small'
                  column={1}
                  style={{ marginBottom: 20 }}
                >
                  <Descriptions.Item label='Kết luận'>
                    {serviceCase.result.conclusion}
                  </Descriptions.Item>
                  <Descriptions.Item label='Phần trăm ADN phù hợp'>
                    {serviceCase.result.adnPercentage}%
                  </Descriptions.Item>
                  <Descriptions.Item label='Người xác nhận'>
                    {serviceCase.result.certifierId.name}
                  </Descriptions.Item>
                </Descriptions>
                <Title level={5}>Hồ sơ ADN</Title>
                {serviceCase.adnDocumentation?.profiles.map(
                  (profile: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 20,
                        border: '1px solid #f0f0f0',
                        padding: 10,
                      }}
                    >
                      <Text strong>{profile.sampleIdentifyNumber}</Text>
                      <Table
                        dataSource={profile.markers}
                        columns={markerColumns}
                        pagination={false}
                        size='small'
                        rowKey='locus'
                      />
                    </div>
                  )
                )}
              </>
            ) : (
              <Text type='secondary'>Chưa có kết quả xét nghiệm.</Text>
            )}
            <Divider />
            <Title level={4}>Hình ảnh hồ sơ</Title>
            {isLoadingImages ? (
              <Spin />
            ) : fullImageUrls.length > 0 ? (
              <Space wrap size={16}>
                {fullImageUrls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Service Case Image ${index + 1}`}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                    }}
                    preview={{ visible: false }}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </Space>
            ) : (
              <Text type='secondary'>Chưa có hình ảnh nào cho hồ sơ này.</Text>
            )}
          </Card>
        </Col>
      </Row>
      <Row justify='space-between' style={{ marginTop: 16 }}>
        <Col>
          <Button type='primary' onClick={() => window.history.back()}>
            Trở về
          </Button>
        </Col>
        <Col>
          <Button type='primary' danger onClick={exportPDF}>
            📄 Xuất PDF
          </Button>
        </Col>
      </Row>
    </div>
  )
}
