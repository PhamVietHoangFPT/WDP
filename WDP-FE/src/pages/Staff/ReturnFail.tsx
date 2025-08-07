import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Table,
  Typography,
  Spin,
  Select,
  Tag,
  Button,
  Modal,
  message,
  Space,
  Empty,
  Input,
  Flex,
  Divider,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
  useGetServiceCaseByEmailForStaffQuery,
  useCreateServiceCaseImageMutation,
} from '../../features/deliveryStaff/deliveryStaff'
import { UserOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useGetAllStatusForCustomerQuery } from '../../features/staff/staffAPI'

const { Title, Text } = Typography

interface TestTaker {
  _id: string
  name: string
  personalId: string
  dateOfBirth: string
  gender: boolean
}

interface Service {
  _id: string
  name: string
  fee: number
  sample: {
    _id: string
    name: string
    fee: number
  }
  timeReturn: string
}

interface ServiceCase {
  _id: string
  created_at: string
  currentStatus: string
  caseMember: {
    testTakers: TestTaker[]
    sampleIdentifyNumbers: string[]
    isSelfSampling: boolean
    isSingleService: boolean
  }
  bookingDetails: {
    bookingDate: string
    slotTime: string
  }
  services: Service[]
  accountDetails: {
    _id: string
    name: string
    phoneNumber: string
  }
  doctorDetails: {
    _id: string
    name: string
    phoneNumber: string
    email: string
  }
  sampleCollectorDetails: {
    _id: string
    name: string
    phoneNumber: string
    email: string
  }
  adnDocumentation: string
  result: string
  condition?: any // Assuming these fields might exist
  paymentForCondition?: any // Assuming these fields might exist
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

// Custom hook for debouncing a value
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const ReturnFail: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )
  const navigate = useNavigate()

  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>('')
  const [updateModalVisible, setUpdateModalVisible] = useState(false)

  const debouncedEmail = useDebounce(customerEmail, 500)

  const {
    data: statusListData,
    isLoading: isLoadingStatus,
    isSuccess: isStatusListSuccess,
  } = useGetAllStatusForCustomerQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  useEffect(() => {
    if (
      isStatusListSuccess &&
      statusListData?.length &&
      selectedStatus === undefined
    ) {
      const defaultFailStatus = statusListData.find(
        (s: ServiceCaseStatus) =>
          s.testRequestStatus === 'Giao kết quả không thành công'
      )
      if (defaultFailStatus) {
        setSelectedStatus(defaultFailStatus._id)
      } else if (statusListData.length > 0) {
        setSelectedStatus(statusListData[0]._id)
      }
    }
  }, [statusListData, isStatusListSuccess, selectedStatus])

  const {
    data: serviceCasesData,
    isLoading: isLoadingCases,
    isFetching: isFetchingCases,
    refetch,
  } = useGetServiceCaseByEmailForStaffQuery(
    {
      serviceCaseStatus: selectedStatus as string,
      email: debouncedEmail,
    },
    { skip: selectedStatus === undefined || !debouncedEmail }
  )

  useEffect(() => {
    if (selectedStatus !== undefined && debouncedEmail) {
      refetch()
    }
  }, [selectedStatus, debouncedEmail, refetch])

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateServiceCaseStatusForDeliveryMutation()

  const [createServiceCaseImage, { isLoading: isUploading }] =
    useCreateServiceCaseImageMutation()

  // This function is not used in the final columns, but kept for context.
  const getAvailableNextStatuses = (currentStatusString: string) => {
    const deliveredStatus = statusListData?.data?.find(
      (s: ServiceCaseStatus) => s.testRequestStatus === 'Đã trả kết quả'
    )
    if (
      currentStatusString === 'Giao kết quả không thành công' &&
      deliveredStatus
    ) {
      return [deliveredStatus]
    }
    return []
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return
    try {
      await updateStatus({
        id: selectedServiceCase._id,
        currentStatus: newStatusId,
      }).unwrap()
      message.success('Cập nhật trạng thái thành công')
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      setNewStatusId('')
      refetch()
    } catch (error: any) {
      message.error(error?.data?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const handleImageUpload = async (file: File, serviceCase: ServiceCase) => {
    const formData = new FormData()
    formData.append('serviceCase', serviceCase._id)
    formData.append('file', file)

    try {
      await createServiceCaseImage(formData).unwrap()
      message.success('Upload ảnh thành công!')
    } catch (error: any) {
      console.error('Upload image error:', error)
      message.error(error?.data?.message || 'Upload ảnh thất bại!')
    }
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: 'Tên người xét nghiệm',
      key: 'testTakerNames',
      render: (_, record) => {
        const testTakers = record.caseMember?.testTakers || []
        if (testTakers.length === 0) {
          return <Text type='secondary'>Chưa có</Text>
        }
        return (
          <Space direction='vertical'>
            {testTakers.map((taker) => (
              <Text key={taker._id}>{taker.name}</Text>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Tên dịch vụ',
      key: 'serviceNames',
      render: (_, record) => {
        const services = record.services || []
        if (services.length === 0) {
          return <Text type='secondary'>Chưa có</Text>
        }
        return (
          <Space direction='vertical'>
            {services.map((service) => (
              <Text key={service._id}>{service.name}</Text>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Số tiền (VNĐ)',
      key: 'fees',
      render: (_, record) => {
        // Calculate service fee from services array
        const serviceFee = (record.services || []).reduce(
          (sum, service) => sum + service.fee,
          0
        )
        // Shipping fee is not present in the provided JSON, so it's a mock value
        const shippingFee = 0

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
      render: (_, record) => {
        const bookingDate = record.bookingDetails?.bookingDate
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
        // 1. ƯU TIÊN KIỂM TRA TRƯỚC: Nếu là tự lấy mẫu
        // Dùng optional chaining (?.) để tránh lỗi nếu record.caseMember không tồn tại
        if (record.caseMember?.isSelfSampling === true) {
          // Sử dụng Tag để đồng bộ về giao diện và chọn màu khác để phân biệt
          return <Tag color='purple'>Khách hàng tự lấy mẫu</Tag>
        }

        // 2. Nếu không phải tự lấy mẫu, tiếp tục với logic cũ
        const collector = record.sampleCollectorDetails

        console.log(collector)

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
      render: (_, record) => {
        const doctor = record.doctorDetails
        if (!doctor || !doctor.name) {
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
      width: 200,
      render: (_, record) => {
        if (!record.result) {
          return <Tag color='default'>Chưa có kết quả</Tag>
        }

        return (
          <span
            onClick={() => navigate(`/service-case-customer/${record._id}`)}
          >
            <Tag color='success'>Đã có kết quả</Tag>
          </span>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => {
        const deliveredStatus = statusListData?.find(
          (s: ServiceCaseStatus) => s.testRequestStatus === 'Đã trả kết quả'
        )
        const isUpdatable =
          record.currentStatus === 'Giao kết quả không thành công' &&
          deliveredStatus

        return (
          <Space direction='vertical' size='small'>
            {isUpdatable && (
              <Button
                key={deliveredStatus?._id}
                onClick={() => {
                  setSelectedServiceCase(record)
                  setNewStatusId(deliveredStatus?._id || '')
                  setUpdateModalVisible(true)
                }}
                type='primary'
              >
                Đã trả kết quả
              </Button>
            )}
            <Button
              onClick={() =>
                navigate(
                  `/staff/return-fail-detail/${record._id}?accountId=${record.accountDetails._id}`
                )
              }
            >
              Xem chi tiết
            </Button>
          </Space>
        )
      },
    },
  ]

  const isCurrentlyLoading = isLoadingCases || isFetchingCases
  const hasDataToShow =
    serviceCasesData?.data && serviceCasesData.data.length > 0

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý hồ sơ khách hàng</Title>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder='Nhập Email khách hàng'
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            setPageNumber(1)
          }}
          style={{ width: 250 }}
          placeholder='Chọn trạng thái'
          loading={isLoadingStatus}
          disabled={isLoadingStatus}
        >
          {(statusListData || []).map((status: ServiceCaseStatus) => (
            <Select.Option key={status._id} value={status._id}>
              {status.testRequestStatus}
            </Select.Option>
          ))}
        </Select>
      </div>

      {isCurrentlyLoading ? (
        <Spin
          tip='Đang tải dữ liệu...'
          style={{ display: 'block', margin: '50px auto' }}
        />
      ) : hasDataToShow ? (
        <Table
          dataSource={serviceCasesData.data}
          columns={columns}
          rowKey='_id'
          pagination={{
            current: pageNumber,
            pageSize,
            // serviceCasesData?.totalRecords || 0,
            onChange: (page, size) => {
              setPageNumber(page)
              setPageSize(size || 10)
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        />
      ) : (
        <Empty description='Không có dữ liệu' />
      )}

      <Modal
        title='Xác nhận cập nhật trạng thái'
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        confirmLoading={isUpdating}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
          setNewStatusId('')
        }}
        okText='Cập nhật'
        cancelText='Hủy'
      >
        <p>
          Mã hồ sơ: <strong>{selectedServiceCase?._id}</strong>
        </p>
        <p>
          Trạng thái hiện tại:{' '}
          <Tag color='red'>{selectedServiceCase?.currentStatus}</Tag>
        </p>
        <p>
          Trạng thái mới:{' '}
          <Tag color={'green'}>
            {
              statusListData?.find((s) => s._id === newStatusId)
                ?.testRequestStatus
            }
          </Tag>
        </p>
      </Modal>
    </div>
  )
}

export default ReturnFail
