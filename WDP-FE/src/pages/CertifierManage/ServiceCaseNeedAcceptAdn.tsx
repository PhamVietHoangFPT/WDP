import { Table, Typography, Button, Spin, Result, Space, List, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { MailOutlined, PhoneOutlined } from '@ant-design/icons'
import {
  useGetServiceCasesWithoutResultQuery,
  useGetTestRequestStatusesQuery,
} from '../../features/certifier/certifierApi'
import { useMemo } from 'react' // ✅ Import thêm useMemo

const { Title } = Typography

// ... Các interface ServiceCase, TestRequestStatus không thay đổi ...
interface ServiceCase {
  _id: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
  bookingDetails: {
    bookingDate: string
    slotTime: string
  }
  doctorDetails: {
    name: string
    phoneNumber: string
    email: string
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

export default function ServiceCaseNeedAcceptAdn() {
  const navigate = useNavigate()

  const { data: statusesData, isLoading: isLoadingStatuses } =
    useGetTestRequestStatusesQuery({})

  // ✅ 1. Dùng useMemo để lấy ID của trạng thái đầu tiên ngay khi có dữ liệu
  const firstStatusId = useMemo(() => {
    if (statusesData?.data?.length > 0) {
      return statusesData.data[0]._id
    }
    return null
  }, [statusesData])

  const {
    data: serviceCaseData,
    isLoading: isLoadingServiceCases,
    isError,
    error,
  } = useGetServiceCasesWithoutResultQuery(
    // ✅ 2. Sử dụng trực tiếp ID của trạng thái đầu tiên
    { currentStatus: firstStatusId, resultExists: false },
    { skip: !firstStatusId } // Không chạy query khi chưa có ID
  )

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      render: (id: string) => <Typography.Text copyable>{id}</Typography.Text>, // Thêm copyable cho tiện
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
            navigate(`/certifier/adn-result/${record._id}`, {
              state: { serviceCase: record },
            })
          }
        >
          Xem kết quả
        </Button>
      ),
    },
  ]

  // Hiển thị loading trong khi chờ lấy trạng thái đầu tiên
  if (isLoadingStatuses) {
    return <Spin />
  }

  if (isError) {
    const apiError = error as any
    const errorMessage = apiError?.data?.message || 'Có lỗi xảy ra'
    const errorStatus = apiError?.status || 'Lỗi'

    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>📄 Hồ sơ chờ duyệt kết quả ADN</Title>
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
      <Title level={3}>📄 Hồ sơ chờ duyệt kết quả ADN</Title>

      {/* ✅ 3. Đã loại bỏ Select component khỏi giao diện */}

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
