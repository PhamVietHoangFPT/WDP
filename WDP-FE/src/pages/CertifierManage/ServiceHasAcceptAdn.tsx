import {
  Table,
  Typography,
  Button,
  Spin,
  Select,
  List,
  Space,
  Tag,
  Result,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { MailOutlined, PhoneOutlined } from '@ant-design/icons'
import {
  useGetServiceCasesWithoutResultQuery,
  useGetTestRequestStatusesQuery,
} from '../../features/certifier/certifierApi'
import { useEffect, useState, useMemo } from 'react' // ✅ Import thêm useMemo

const { Title } = Typography

// ... Các interface ServiceCase, TestRequestStatus không thay đổi ...
interface ServiceCase {
  _id: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
  doctorDetails: {
    name: string
    phoneNumber: string
    email: string
  }
  bookingDetails: {
    bookingDate: string
    slotTime: string
  }
  caseMember: {
    testTakers: {
      _id: string
      name: string
      personalId: string
      dateOfBirth: string
      gender: boolean
    }[]
  }
  accountDetails: {
    _id: string
    name: string
    phoneNumber: string
  }
  services: {
    _id: string
    fee: number
    sample: {
      _id: string
      name: string
      fee: number
    }
    timeReturn: string
  }[]
}

interface TestRequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

export default function ServiceHasAcceptAdn() {
  const navigate = useNavigate()

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const { data: statusesData, isLoading: isLoadingStatuses } =
    useGetTestRequestStatusesQuery({})

  // ✅ 1. Tạo một danh sách trạng thái mới, bỏ đi phần tử đầu tiên
  const filteredStatuses = useMemo(() => {
    if (statusesData?.data && statusesData.data.length > 1) {
      // slice(1) tạo ra một mảng mới từ phần tử thứ 2 (index 1) trở đi
      return statusesData.data.slice(1)
    }
    return []
  }, [statusesData])

  const {
    data: serviceCaseData,
    isLoading: isLoadingServiceCases,
    error,
    isError,
  } = useGetServiceCasesWithoutResultQuery(
    { currentStatus: selectedStatus, resultExists: true },
    { skip: !selectedStatus }
  )

  // ✅ 2. Cập nhật useEffect để hoạt động với danh sách đã lọc
  useEffect(() => {
    // Chỉ chạy khi có dữ liệu trong danh sách đã lọc và chưa có trạng thái nào được chọn
    if (filteredStatuses.length > 0 && !selectedStatus) {
      // Tìm trạng thái "Đã có kết quả" trong danh sách đã lọc
      const defaultStatus = filteredStatuses.find(
        (status: TestRequestStatus) => status._id === '688f552b8bd4809753741bd8'
      )
      // Nếu không tìm thấy, lấy trạng thái đầu tiên trong danh sách đã lọc
      const fallbackStatus = filteredStatuses[0]

      if (defaultStatus) {
        setSelectedStatus(defaultStatus._id)
      } else if (fallbackStatus) {
        setSelectedStatus(fallbackStatus._id)
      }
    }
  }, [filteredStatuses, selectedStatus]) // Phụ thuộc vào danh sách đã lọc

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      render: (id: string) => <Typography.Text>{id}</Typography.Text>, // Thêm copyable cho tiện
    },
    {
      title: 'Ngày đặt',
      dataIndex: ['bookingDetails', 'bookingDate'],
      render: (bookingDate: string) =>
        bookingDate ? new Date(bookingDate).toLocaleDateString('vi-VN') : '',
    },
    {
      title: 'Ca đặt',
      dataIndex: ['bookingDetails', 'slotTime'],
    },
    {
      title: 'Bác sĩ xét nghiệm',
      dataIndex: 'doctorDetails',
      render: (doctor: ServiceCase['doctorDetails']) => (
        <Space direction='vertical' size='small'>
          <Typography.Text strong>{doctor.name}</Typography.Text>
          <Typography.Text type='secondary'>
            <MailOutlined /> {doctor.email}
          </Typography.Text>
          <Typography.Text type='secondary'>
            <PhoneOutlined /> {doctor.phoneNumber}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Người xét nghiệm',
      dataIndex: 'caseMember',
      render: (caseMember: ServiceCase['caseMember']) => (
        <List
          size='small'
          dataSource={caseMember.testTakers}
          renderItem={(taker) => (
            <List.Item style={{ paddingLeft: 0, border: 'none' }}>
              - {taker.name} ({taker.personalId})
            </List.Item>
          )}
          style={{ background: 'transparent' }}
        />
      ),
    },
    {
      title: 'Người tạo hồ sơ',
      dataIndex: 'accountDetails',
      render: (acc: ServiceCase['accountDetails']) => (
        <Space direction='vertical' size={0}>
          <Typography.Text strong>{acc.name}</Typography.Text>
          <Typography.Text type='secondary'>
            <PhoneOutlined /> {acc.phoneNumber}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'services',
      render: (services: ServiceCase['services']) => (
        <List
          size='small'
          dataSource={services}
          renderItem={(s) => (
            <List.Item style={{ paddingLeft: 0, border: 'none' }}>
              {s.sample.name} – <Tag color='blue'>{s.timeReturn}</Tag>
            </List.Item>
          )}
          style={{ background: 'transparent' }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: ServiceCase) => (
        <Button
          type='primary'
          size='small'
          onClick={() =>
            navigate(`/certifier/view-adn-documentation/${record._id}`, {
              state: { serviceCase: record },
            })
          }
        >
          Xem kết quả
        </Button>
      ),
    },
  ]

  if (isError) {
    const apiError = error as any
    const errorMessage = apiError?.data?.message || 'Có lỗi xảy ra'
    const errorStatus = apiError?.status || 'Lỗi'

    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>📄 Hồ sơ chờ duyệt kết quả ADN</Title>
        <Select
          style={{ width: 250, marginBottom: 16 }}
          placeholder='Chọn trạng thái để lọc'
          loading={isLoadingStatuses}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
        >
          {/* ✅ 3. Dùng danh sách đã lọc để render các tùy chọn */}
          {filteredStatuses.map((status: TestRequestStatus) => (
            <Select.Option key={status._id} value={status._id}>
              {status.testRequestStatus}
            </Select.Option>
          ))}
        </Select>
        <Result
          status={errorStatus === 404 ? '404' : 'error'}
          title={errorStatus}
          subTitle={errorMessage}
          style={{ marginTop: '20px' }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📄 Hồ sơ đã có kết quả ADN</Title>
      <Select
        style={{ width: 250, marginBottom: 16 }}
        placeholder='Chọn trạng thái để lọc'
        loading={isLoadingStatuses}
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
      >
        {/* ✅ 3. Dùng danh sách đã lọc để render các tùy chọn */}
        {filteredStatuses.map((status: TestRequestStatus) => (
          <Select.Option key={status._id} value={status._id}>
            {status.testRequestStatus}
          </Select.Option>
        ))}
      </Select>
      {isLoadingServiceCases ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={(serviceCaseData?.data as ServiceCase[]) || []}
          rowKey='_id'
          locale={{ emptyText: 'Không có hồ sơ nào chờ duyệt.' }}
          pagination={false}
        />
      )}
    </div>
  )
}
