import {
  Card,
  Table,
  Typography,
  Button,
  Pagination,
  Tag,
  Flex,
  Divider,
  Select,
  message,
  Space,
  Modal,
  Tooltip,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useGetServiceCasesListQuery,
  useCreatePaymentForConditionMutation,
} from '../../features/customer/paymentApi'
import {
  useGetAllStatusForCustomerQuery,
  useUpdateServiceCaseStatusForStaffMutation,
} from '../../features/staff/staffAPI'
import { useState } from 'react'
const { Title, Text } = Typography
const { Option } = Select
import { UserOutlined, PhoneOutlined } from '@ant-design/icons'
import type { ColumnType } from 'antd/es/table'

export default function ServiceCase() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '5'
  const currentStatusParam = searchParams.get('currentStatus') || null
  const [currentStatus, setCurrentStatus] = useState(currentStatusParam)

  const { data: statusData } = useGetAllStatusForCustomerQuery({})
  const { data, isLoading, refetch } = useGetServiceCasesListQuery({
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
    currentStatus: currentStatus,
  })

  // 1. Lấy hàm trigger mutation và trạng thái loading từ hook
  const [createPayment] = useCreatePaymentForConditionMutation()
  // Thêm mutation cho update status
  const [updateServiceCaseStatus] = useUpdateServiceCaseStatusForStaffMutation()

  // 2. Tạo state để quản lý loading cho từng dòng cụ thể khi thanh toán
  const [loadingPaymentFor, setLoadingPaymentFor] = useState<string | null>(
    null
  )
  // Thêm state để quản lý loading cho nút hoàn thành
  const [loadingCompleteFor, setLoadingCompleteFor] = useState<string | null>(
    null
  )

  // States for image display
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  // 3. Tạo hàm xử lý việc thanh toán
  const handlePayment = async (serviceCaseId: string) => {
    setLoadingPaymentFor(serviceCaseId)
    console.log(serviceCaseId)
    try {
      const response = await createPayment({ serviceCaseId }).unwrap()
      if (
        typeof response.redirectUrl === 'string' &&
        response.redirectUrl.trim() !== ''
      ) {
        window.open(response.redirectUrl, '_blank', 'noopener,noreferrer')
      } else {
        message.error('Không nhận được đường dẫn thanh toán.')
      }
    } catch (err) {
      console.error('Lỗi khi tạo yêu cầu thanh toán:', err)
      message.error('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.')
    } finally {
      setLoadingPaymentFor(null)
    }
  }

  // Thêm hàm xử lý hoàn thành
  const handleComplete = async (serviceCaseId: string) => {
    setLoadingCompleteFor(serviceCaseId)
    try {
      // Tìm ID của trạng thái "Hoàn thành"
      const completeStatus = statusData?.find(
        (status: any) => status.testRequestStatus === 'Hoàn thành'
      )

      if (!completeStatus) {
        message.error('Không tìm thấy trạng thái hoàn thành.')
        return
      }

      await updateServiceCaseStatus({
        id: serviceCaseId,
        currentStatus: completeStatus._id,
      }).unwrap()

      message.success('Đã cập nhật trạng thái thành công!')
      refetch() // Tải lại dữ liệu để cập nhật bảng
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err)
      message.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    } finally {
      setLoadingCompleteFor(null)
    }
  }

  const columns: Array<ColumnType<any>> = [
    {
      title: 'Tên người xét nghiệm',
      key: 'testTakerNames',
      render: (_: any, record: any) => {
        const testTakers = record.caseMember?.testTaker || []
        if (testTakers.length === 0) {
          return <Text type='secondary'>Chưa có</Text>
        }
        return (
          <Space direction='vertical'>
            {testTakers.map((taker: any) => (
              <Text key={taker._id}>{taker.name}</Text>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Tên dịch vụ',
      key: 'serviceNames',
      render: (_: any, record: any) => {
        const services = record.caseMember?.service || []
        if (services.length === 0) {
          return <Text type='secondary'>Chưa có</Text>
        }
        return (
          <Space direction='vertical'>
            {services.map((service: any) => (
              <Text key={service._id}>{service.sample.name}</Text>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Số tiền (VNĐ)',
      key: 'fees',
      render: (_: any, record: { totalFee: number; shippingFee: number }) => {
        const serviceFee =
          typeof record.totalFee === 'number' ? record.totalFee : 0
        const shippingFee =
          typeof record.shippingFee === 'number' ? record.shippingFee : 0
        const grandTotal = serviceFee + shippingFee
        return (
          <div style={{ minWidth: 200 }}>
            <Flex justify='space-between'>
              <Typography.Text>Chi phí dịch vụ:</Typography.Text>
              <Typography.Text>
                {serviceFee.toLocaleString('vi-VN')} ₫
              </Typography.Text>
            </Flex>
            <Flex justify='space-between'>
              <Typography.Text>Phí dịch vụ:</Typography.Text>
              <Typography.Text>
                {shippingFee.toLocaleString('vi-VN')} ₫
              </Typography.Text>
            </Flex>
            <Divider style={{ margin: '4px 0' }} />
            <Flex justify='space-between'>
              <Typography.Text strong>Tổng cộng:</Typography.Text>
              <Typography.Text strong style={{ color: '#1677ff' }}>
                {grandTotal.toLocaleString('vi-VN')} ₫
              </Typography.Text>
            </Flex>
          </div>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => {
        const d = new Date(date)
        return `${d.toLocaleTimeString('vi-VN')} ${d.toLocaleDateString(
          'vi-VN'
        )}`
      },
    },
    {
      title: 'Ngày đặt',
      key: 'bookingDate',
      render: (
        _: any,
        record: {
          caseMember: {
            booking: {
              bookingDate: string
              slot?: { slotTemplate?: { facility?: { facilityName: string } } }
            }
          }
        }
      ) => {
        const bookingDate = record.caseMember?.booking?.bookingDate
        const facilityName =
          record.caseMember?.booking?.slot?.slotTemplate?.facility?.facilityName

        if (!bookingDate) {
          return <Tag color='default'>Chưa đặt</Tag>
        }
        const date = new Date(bookingDate)
        const formattedDate = date.toLocaleDateString('vi-VN')
        return (
          <Space direction='vertical' size={2}>
            <Typography.Text>{formattedDate}</Typography.Text>
            {facilityName && (
              <Typography.Text type='secondary' style={{ fontSize: '12px' }}>
                ({facilityName})
              </Typography.Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Nhân viên lấy mẫu',
      key: 'sampleCollector',
      dataIndex: ['sampleCollector', 'name'],
      render: (_, record: any) => {
        if (record.caseMember?.isSelfSampling === true) {
          return <Tag color='purple'>Khách hàng tự lấy mẫu</Tag>
        }
        const collector = record.sampleCollector
        if (!collector) {
          return <Tag>Chưa chỉ định</Tag>
        }
        return (
          <Space direction='vertical' size={0}>
            <Space>
              <UserOutlined />
              <Typography.Text strong>{collector.name}</Typography.Text>
            </Space>
            <Space>
              <PhoneOutlined />
              <Typography.Text type='secondary'>
                {collector.phoneNumber}
              </Typography.Text>
            </Space>
          </Space>
        )
      },
    },
    {
      title: 'Bác sĩ phụ trách',
      key: 'doctor',
      dataIndex: ['doctor', 'name'],
      render: (_, record: any) => {
        const doctor = record.doctor
        if (!doctor) {
          return <Tag>Chưa chỉ định</Tag>
        }
        return (
          <Space>
            <UserOutlined />
            <Typography.Text>{doctor.name}</Typography.Text>
          </Space>
        )
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: ['currentStatus', 'testRequestStatus'],
      render: (status: string) => {
        let color = 'default'
        if (status?.includes('Chờ')) color = 'blue'
        else if (status?.includes('hoàn thành')) color = 'green'
        else if (status?.includes('Hủy')) color = 'red'
        else if (status?.includes('Đã trả kết quả')) color = 'green'
        if (!status) {
          return <Tag>N/A</Tag>
        }
        const maxLength = 25
        let displayStatus = status
        if (status.length > maxLength) {
          displayStatus = status.substring(0, maxLength) + '...'
        }
        return (
          <Tooltip title={status}>
            <Tag color={color}>{displayStatus}</Tag>
          </Tooltip>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => {
        const currentStatusText = record.currentStatus?.testRequestStatus
        return (
          <Space direction='vertical'>
            {/* {currentStatusText === 'Đã trả kết quả' && (
              <Button
                type='primary'
                onClick={() => handleComplete(record._id)}
                loading={loadingCompleteFor === record._id}
              >
                Hoàn thành
              </Button>
            )} */}
            <Button
              onClick={() => navigate(`/service-case-customer/${record._id}`)}
            >
              Xem chi tiết
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <Card style={{ margin: '40px auto' }}>
        <Title level={3}>Lịch sử trường hợp dịch vụ</Title>
        <Flex
          justify='space-between'
          align='center'
          style={{ marginBottom: 20 }}
        >
          <Flex align='center' gap={8}>
            <Text>Trạng thái:</Text>
            <Select
              value={currentStatus || ''}
              style={{ width: 200 }}
              onChange={(value) => {
                setCurrentStatus(value)
                navigate(
                  `/service-case-customer?pageNumber=1&pageSize=${pageSize}&currentStatus=${value}`
                )
              }}
            >
              <Option value=''>Tất cả</Option>
              {statusData?.map((status: any) => (
                <Option key={status._id} value={status._id}>
                  {status.testRequestStatus}
                </Option>
              ))}
            </Select>
          </Flex>
        </Flex>
        <Table
          loading={isLoading}
          rowKey='_id'
          dataSource={data?.data || []}
          columns={columns}
          pagination={false}
        />
        <Pagination
          current={Number(pageNumber)}
          pageSize={Number(pageSize)}
          total={data?.pagination?.totalItems || 0}
          onChange={(page, size) => {
            navigate(
              `/service-case-customer?pageNumber=${page}&pageSize=${size}&currentStatus=${currentStatus}`
            )
          }}
          showSizeChanger
          showTotal={(total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} hồ sơ`
          }
          pageSizeOptions={['5', '10', '20']}
          style={{
            marginTop: '20px',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        />
      </Card>
      <Modal
        title='Hình ảnh hồ sơ dịch vụ'
        open={isImageModalVisible}
        onCancel={() => {
          setIsImageModalVisible(false)
          setImageUrls([])
        }}
        footer={null}
        centered
        width={700}
      >
        {imageUrls.length > 0 ? (
          <Space direction='vertical' style={{ width: '100%' }}>
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url || '/placeholder.svg'}
                alt={`Service Case Image ${index + 1}`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '10px auto',
                  border: '1px solid #eee',
                }}
              />
            ))}
          </Space>
        ) : (
          <p>Không có hình ảnh để hiển thị.</p>
        )}
      </Modal>
    </div>
  )
}