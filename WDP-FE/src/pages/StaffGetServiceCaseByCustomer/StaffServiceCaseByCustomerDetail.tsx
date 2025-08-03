import {
  Card,
  Typography,
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
import { useParams } from 'react-router-dom'
import {
  useGetImageQuery,
  useGetServiceCaseByIdQuery,
} from '../../features/customer/paymentApi'
import { useState, useEffect } from 'react'
import { PhoneOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function StaffServiceCaseByCustomerDetail() {
  const { id } = useParams()

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

  if (isLoadingServiceCase) {
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
          <Text strong>Phí ship:</Text>
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
        const shippingFee = record.shippingFee || 0
        const total = serviceTotal + shippingFee
        return (
          <Space direction='vertical'>
            {services?.map((service, index) => (
              <Text key={index}>{service.fee.toLocaleString('vi-VN')} ₫</Text>
            ))}
            <Text>{shippingFee.toLocaleString('vi-VN')} ₫</Text>
            <Divider style={{ margin: '4px 0' }} />
            <Text strong>{total.toLocaleString('vi-VN')} ₫</Text>
          </Space>
        )
      },
    },
  ]

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
      render: (alleles: string[]) => alleles.join(', '),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Chi tiết hồ sơ dịch vụ</Title>
      <Row gutter={16}>
        <Col span={24}>
          <Card>
            <Title level={4}>Thông tin chung</Title>
            <Descriptions bordered size='small' column={1}>
              <Descriptions.Item label='Mã hồ sơ'>
                {serviceCase?._id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày tạo'>
                {serviceCase?.created_at
                  ? new Date(serviceCase.created_at).toLocaleString('vi-VN')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label='Ngày đặt'>
                {serviceCase?.caseMember?.booking?.bookingDate
                  ? new Date(
                      serviceCase.caseMember.booking.bookingDate
                    ).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label='Trạng thái hiện tại'>
                <Tag color='blue'>
                  {serviceCase?.currentStatus?.testRequestStatus || 'N/A'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Thông tin khách hàng</Title>
            <Descriptions bordered size='small' column={1}>
              <Descriptions.Item label='Tên tài khoản'>
                {serviceCase?.account?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label='Số điện thoại'>
                {serviceCase?.account?.phoneNumber || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Thông tin người xét nghiệm</Title>
            <Descriptions bordered size='small' column={1}>
              {serviceCase?.caseMember?.testTaker?.length > 0 ? (
                serviceCase.caseMember.testTaker.map((taker: any) => (
                  <Descriptions.Item key={taker._id} label='Họ và tên'>
                    {taker.name} (CMND/CCCD: {taker.personalId})
                  </Descriptions.Item>
                ))
              ) : (
                <Descriptions.Item label='Họ và tên'>N/A</Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={4}>Dịch vụ đã chọn</Title>
            <Descriptions bordered size='small' column={1}>
              {serviceCase?.caseMember?.service?.length > 0 ? (
                serviceCase.caseMember.service.map((service: any) => (
                  <Descriptions.Item key={service._id} label='Dịch vụ'>
                    {service.name} (Loại mẫu: {service.sample?.name || 'N/A'}) -
                    Thời gian trả kết quả:{' '}
                    {service.timeReturn?.timeReturn || 'N/A'} ngày
                  </Descriptions.Item>
                ))
              ) : (
                <Descriptions.Item label='Dịch vụ'>N/A</Descriptions.Item>
              )}
              <Descriptions.Item label='Hình thức lấy mẫu'>
                {serviceCase?.caseMember?.isAtHome !== undefined ? (
                  serviceCase.caseMember.isAtHome ? (
                    <Tag color='green'>Lấy mẫu tại nhà</Tag>
                  ) : (
                    <Tag>Lấy mẫu tại trung tâm</Tag>
                  )
                ) : (
                  'N/A'
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
                    <Text strong>
                      {serviceCase.sampleCollector.name || 'N/A'}
                    </Text>
                    <Text type='secondary'>
                      <PhoneOutlined />{' '}
                      {serviceCase.sampleCollector.phoneNumber || 'N/A'}
                    </Text>
                  </Space>
                ) : (
                  <Tag>Chưa chỉ định</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label='Bác sĩ phụ trách'>
                {serviceCase?.doctor ? (
                  <Space direction='vertical'>
                    <Text strong>{serviceCase.doctor.name || 'N/A'}</Text>
                    <Text type='secondary'>
                      <PhoneOutlined />{' '}
                      {serviceCase.doctor.phoneNumber || 'N/A'}
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
                    {serviceCase.result.conclusion || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Phần trăm ADN phù hợp'>
                    {serviceCase.result.adnPercentage || 'N/A'}%
                  </Descriptions.Item>
                  <Descriptions.Item label='Người xác nhận'>
                    {serviceCase.result.certifierId?.name || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
                <Title level={5}>Hồ sơ ADN</Title>
                {serviceCase.adnDocumentation?.profiles?.length > 0 ? (
                  serviceCase.adnDocumentation.profiles.map(
                    (profile: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: 20,
                          border: '1px solid #f0f0f0',
                          padding: 10,
                        }}
                      >
                        <Text strong>
                          {profile.sampleIdentifyNumber || 'N/A'}
                        </Text>
                        <Table
                          dataSource={profile.markers}
                          columns={markerColumns}
                          pagination={false}
                          size='small'
                          rowKey='locus'
                        />
                      </div>
                    )
                  )
                ) : (
                  <Text type='secondary'>Không có hồ sơ ADN.</Text>
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
                    onClick={() => {
                      window.open(url, '_blank')
                    }}
                  />
                ))}
              </Space>
            ) : (
              <Text type='secondary'>Chưa có hình ảnh nào cho hồ sơ này.</Text>
            )}
          </Card>
        </Col>
      </Row>
      <Button
        type='primary'
        style={{ marginTop: 16 }}
        onClick={() => window.history.back()}
      >
        Trở về
      </Button>
    </div>
  )
}
