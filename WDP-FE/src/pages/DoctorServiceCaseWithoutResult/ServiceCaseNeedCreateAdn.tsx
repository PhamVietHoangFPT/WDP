import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Typography,
  Select,
  Tag,
  Spin,
  Button,
  message,
  Modal,
  Result,
  List,
} from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
  useUpdateServiceCaseStatusMutation,
} from '../../features/doctor/doctorAPI'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { confirm } = Modal

// --- Các interface (ServiceCase, RequestStatus) không thay đổi ---
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

interface RequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

export default function ServiceCaseNeedCreateAdn() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const resultExists = false
  const navigate = useNavigate()

  const { data: statusData, isLoading: loadingStatus } =
    useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })

  const {
    data: serviceCaseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetServiceCasesWithoutAdnQuery(
    { currentStatus: selectedStatus, resultExists, pageNumber, pageSize },
    { skip: !selectedStatus }
  )

  const [updateStatus, { isLoading: updating }] =
    useUpdateServiceCaseStatusMutation()

  // ✅ Cải thiện logic đặt trạng thái mặc định
  useEffect(() => {
    // Chỉ chạy khi có dữ liệu trạng thái và chưa có trạng thái nào được chọn
    if (statusData?.data?.length && !selectedStatus) {
      // Ưu tiên tìm "Đã nhận mẫu" làm mặc định
      const defaultStatus = statusData.data.find(
        (s: RequestStatus) => s.testRequestStatus === 'Đã nhận mẫu'
      )
      // Nếu không tìm thấy, lấy trạng thái đầu tiên trong danh sách
      const fallbackStatus = statusData.data[0]

      const statusToSet = defaultStatus || fallbackStatus

      if (statusToSet) {
        setSelectedStatus(statusToSet._id)
        setSelectedOrder(statusToSet.order)
      }
    }
  }, [statusData, selectedStatus])

  // Lấy ra danh sách tất cả các trạng thái từ API
  const allStatuses = useMemo(
    () => (statusData?.data as RequestStatus[])?.slice(0, 2) || [],
    [statusData]
  )

  const handleUpdateStatus = (id: string, newStatus: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn cập nhật trạng thái?',
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await updateStatus({ id, currentStatus: newStatus }).unwrap()
          message.success('Cập nhật trạng thái thành công!')
          refetch()
        } catch (err: any) {
          console.log(err)
          message.error(err?.data?.message || 'Lỗi khi cập nhật trạng thái')
        }
      },
    })
  }

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      render: (id: string) => <Typography.Text>{id}</Typography.Text>,
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
      title: 'Người xét nghiệm',
      dataIndex: 'caseMember',
      render: (caseMember: ServiceCase['caseMember']) => (
        <div>
          {caseMember?.testTakers?.map((taker) => (
            <div key={taker._id}>{`${taker.name} (${taker.personalId})`}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'Người tạo hồ sơ',
      dataIndex: 'accountDetails',
      render: (acc: ServiceCase['accountDetails']) => (
        <div>
          {acc.name}
          <br />
          <Typography.Text type='secondary' style={{ fontSize: 12 }}>
            {acc.phoneNumber}
          </Typography.Text>
        </div>
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
              - {s.sample.name}
            </List.Item>
          )}
          style={{ padding: 0, background: 'transparent' }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: ServiceCase) => {
        // Lấy order của trạng thái đang được chọn ở bộ lọc chính
        const currentSelectedOrder = selectedOrder ?? -1

        // ✅ Logic cột hành động không đổi, nhưng sử dụng `allStatuses`
        if (currentSelectedOrder === 6) {
          // Đang phân tích
          return (
            <Button
              type='primary'
              size='small'
              onClick={() =>
                navigate(`/doctor/create-adn-document/${record._id}`, {
                  state: { serviceCase: record },
                })
              }
            >
              Nhập kết quả phân tích
            </Button>
          )
        }

        if (currentSelectedOrder === 7) {
          // Chờ duyệt kết quả
          return <Tag color='orange'>Đang chờ duyệt kết quả</Tag>
        }

        // Chỉ hiện các trạng thái có `order` lớn hơn trạng thái hiện tại
        const availableStatusOptions = allStatuses.filter(
          (s) => s.order > currentSelectedOrder
        )

        return (
          <Select
            placeholder='Chọn trạng thái mới'
            style={{ width: 180 }}
            size='small'
            loading={updating}
            onChange={(newStatus) => handleUpdateStatus(record._id, newStatus)}
          >
            {availableStatusOptions.map((status) => (
              <Select.Option key={status._id} value={status._id}>
                {status.testRequestStatus}
              </Select.Option>
            ))}
          </Select>
        )
      },
    },
  ]

  // Component để render phần bộ lọc
  const FilterSection = () => (
    <div style={{ marginBottom: 16 }}>
      <Select
        value={selectedStatus}
        onChange={(value) => {
          const found = allStatuses.find((s) => s._id === value)
          setSelectedStatus(value)
          setSelectedOrder(found?.order || null)
          setPageNumber(1) // Reset về trang 1 khi đổi bộ lọc
        }}
        style={{ width: 250 }}
        loading={loadingStatus}
      >
        {/* ✅ Sử dụng `allStatuses` để hiển thị tất cả các tùy chọn */}
        {allStatuses.map((s) => (
          <Select.Option key={s._id} value={s._id}>
            {s.testRequestStatus}
          </Select.Option>
        ))}
      </Select>
    </div>
  )

  if (isError) {
    const apiError = error as any
    const errorMessage = apiError?.data?.message || 'Có lỗi xảy ra'
    const errorStatus = apiError?.status || 'Lỗi'

    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>📄 Hồ sơ chưa có tài liệu ADN</Title>
        <FilterSection />
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
      <Title level={3}>📄 Hồ sơ chưa có tài liệu ADN</Title>

      <FilterSection />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={(serviceCaseData?.data as ServiceCase[]) || []}
          rowKey='_id'
          locale={{ emptyText: 'Chưa có hồ sơ nào.' }}
          pagination={{
            current: pageNumber,
            pageSize,
            total: serviceCaseData?.totalRecords || 0, // Sử dụng total từ API nếu có
            onChange: (page, size) => {
              setPageNumber(page)
              setPageSize(size || 10)
            },
          }}
        />
      )}
    </div>
  )
}
