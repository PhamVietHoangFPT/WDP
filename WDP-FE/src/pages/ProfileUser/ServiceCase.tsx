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
  Modal, // Import Modal
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useGetServiceCasesListQuery,
  useCreatePaymentForConditionMutation,
  useGetImageQuery, // Import useGetImageQuery
} from '../../features/customer/paymentApi'
import { useGetAllStatusForCustomerQuery } from '../../features/staff/staffAPI'
import { useState } from 'react'
const { Title, Text } = Typography
const { Option } = Select
import { UserOutlined, PhoneOutlined } from '@ant-design/icons'

export default function ServiceCase() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '5'
  const currentStatusParam = searchParams.get('currentStatus') || null
  const [currentStatus, setCurrentStatus] = useState(currentStatusParam)
  const { data: statusData } = useGetAllStatusForCustomerQuery({})

  const { data, isLoading } = useGetServiceCasesListQuery({
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
    currentStatus: currentStatus,
  })

  // 1. Lấy hàm trigger mutation và trạng thái loading từ hook
  const [createPayment, { isLoading: isPaymentLoading }] =
    useCreatePaymentForConditionMutation()

  // 2. Tạo state để quản lý loading cho từng dòng cụ thể khi thanh toán
  const [loadingPaymentFor, setLoadingPaymentFor] = useState<string | null>(
    null
  )

  // States for image display
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([]) // Thay đổi thành mảng các URL
  const [loadingImageFor, setLoadingImageFor] = useState<string | null>(null) // State để quản lý loading khi lấy ảnh

  // 3. Tạo hàm xử lý việc thanh toán
  const handlePayment = async (serviceCaseId: string) => {
    setLoadingPaymentFor(serviceCaseId) // Bật loading cho dòng được click
    console.log(serviceCaseId)
    try {
      // Gọi API, .unwrap() sẽ trả về data nếu thành công hoặc ném lỗi nếu thất bại
      const response = await createPayment({ serviceCaseId }).unwrap()

      // Nếu có redirectUrl, chuyển hướng người dùng
      if (
        typeof response.redirectUrl === 'string' &&
        response.redirectUrl.trim() !== ''
      ) {
        // Mở URL trong một tab mới.
        // Thêm 'noopener,noreferrer' là một thông lệ tốt để tăng cường bảo mật.
        window.open(response.redirectUrl, '_blank', 'noopener,noreferrer')
      } else {
        message.error('Không nhận được đường dẫn thanh toán.')
      }
    } catch (err) {
      console.error('Lỗi khi tạo yêu cầu thanh toán:', err)
      message.error('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.')
    } finally {
      setLoadingPaymentFor(null) // Tắt loading sau khi hoàn tất
    }
  }

  // Handle viewing image - đã cập nhật để lấy nhiều ảnh
  const handleViewImage = async (serviceCaseId: string) => {
    setLoadingImageFor(serviceCaseId) // Bật loading cho nút xem ảnh của dòng này
    try {
      // Gọi API getImage
      const response = await fetch(
        `http://localhost:5000/images/findForServiceCase/${serviceCaseId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch image data.')
      }
      const data = await response.json()

      // Kiểm tra nếu có dữ liệu và URL hợp lệ
      if (data && data.length > 0) {
        const fullImageUrls = data
          .filter((item: any) => item.url)
          .map((item: any) => `http://localhost:5000${item.url}`)
        setImageUrls(fullImageUrls)
        setIsImageModalVisible(true)
      } else {
        message.info('Không có hình ảnh nào cho hồ sơ này.')
        setImageUrls([]) // Đảm bảo mảng rỗng nếu không có ảnh
      }
    } catch (error) {
      console.error('Lỗi khi lấy ảnh:', error)
      message.error('Không thể tải hình ảnh. Vui lòng thử lại.')
    } finally {
      setLoadingImageFor(null) // Tắt loading
    }
  }

  const columns = [
    {
      title: 'Tên người xét nghiệm',
      key: 'testTakerNames',
      render: (_: any, record: any) => {
        const testTakers = record.caseMember?.testTaker || []
        if (testTakers.length === 0) {
          return <Text type="secondary">Chưa có</Text>
        }
        return (
          <Space direction="vertical">
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
          return <Text type="secondary">Chưa có</Text>
        }
        return (
          <Space direction="vertical">
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
        // Để code dễ đọc hơn, ta coi totalFee là phí dịch vụ
        const serviceFee =
          typeof record.totalFee === 'number' ? record.totalFee : 0
        const shippingFee =
          typeof record.shippingFee === 'number' ? record.shippingFee : 0

        // Tính tổng cộng
        const grandTotal = serviceFee + shippingFee

        return (
          // Sử dụng Flex để căn chỉnh các mục dễ dàng
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
        record: { caseMember: { booking: { bookingDate: string } } }
      ) => {
        const bookingDate = record.caseMember?.booking?.bookingDate
        if (!bookingDate) return <Tag color='default'>Chưa đặt</Tag>
        const date = new Date(bookingDate)
        return (
          <Typography.Text>{date.toLocaleDateString('vi-VN')}</Typography.Text>
        )
      },
    },
    {
      title: 'Nhân viên lấy mẫu',
      key: 'sampleCollector',
      dataIndex: ['sampleCollector', 'name'], // Giúp cho việc sắp xếp theo tên
      render: (_, record: any) => {
        const collector = record.sampleCollector

        // Nếu không có thông tin nhân viên, hiển thị tag
        if (!collector) {
          return <Tag>Chưa chỉ định</Tag>
        }

        // Nếu có, hiển thị tên và số điện thoại
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
      title: 'Kết quả',
      key: 'result_action',
      align: 'center',
      width: 200, // Tăng chiều rộng để chứa nút mới
      render: (
        _: any,
        record: {
          _id: string
          result: string
          condition: any
          paymentForCondition: any
        }
      ) => {
        // Case 1: Chưa có kết quả (giữ nguyên)
        if (!record.result) {
          return <Tag color='default'>Chưa có kết quả</Tag>
        }

        // Case 2: Cần thanh toán chi phí phát sinh
        const isPaymentRequired =
          record.condition !== null && record.paymentForCondition === null

        if (isPaymentRequired) {
          return (
            <Button
              type='primary' // ✅ Thay `danger` bằng `primary` cho hợp lý hơn
              onClick={() => handlePayment(record._id)}
              loading={loadingPaymentFor === record._id}
            >
              Thanh toán chi phí phát sinh để xem kết quả
            </Button>
          )
        }

        // Case 3: Có thể xem kết quả (giữ nguyên)
        return (
          <Button
            type='primary'
            onClick={() => navigate(`/result/${record.result}`)}
          >
            Xem kết quả
          </Button>
        )
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
        <Space direction='vertical'>
          <Button
            onClick={() => navigate(`/service-case-customer/${record._id}`)}
          >
            Xem chi tiết
          </Button>
          <Button
            onClick={() => handleViewImage(record._id)}
            loading={loadingImageFor === record._id} // Thêm loading state cho nút
          >
            Xem hình ảnh
          </Button>
        </Space>
      ),
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
              style={{ width: 200 }} // Antd Select thường cần set width
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

      {/* Modal để hiển thị hình ảnh */}
      <Modal
        title='Hình ảnh hồ sơ dịch vụ'
        open={isImageModalVisible}
        onCancel={() => {
          setIsImageModalVisible(false)
          setImageUrls([]) // Reset mảng URL khi đóng modal
        }}
        footer={null} // Không hiển thị footer
        centered
        width={700} // Điều chỉnh chiều rộng modal
      >
        {imageUrls.length > 0 ? (
          <Space direction='vertical' style={{ width: '100%' }}>
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Service Case Image ${index + 1}`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '10px auto', // Khoảng cách giữa các ảnh
                  border: '1px solid #eee', // Thêm border cho đẹp
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