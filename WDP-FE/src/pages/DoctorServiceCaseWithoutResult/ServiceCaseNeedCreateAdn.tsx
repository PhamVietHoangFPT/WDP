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
} from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
  useUpdateServiceCaseStatusMutation,
} from '../../features/doctor/doctorAPI'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { confirm } = Modal

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
    error,
    refetch,
  } = useGetServiceCasesWithoutAdnQuery(
    { currentStatus: selectedStatus, resultExists },
    { skip: !selectedStatus }
  )

  const [updateStatus, { isLoading: updating }] =
    useUpdateServiceCaseStatusMutation()

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

  useEffect(() => {
    if (statusData?.data?.length && !selectedStatus) {
      const defaultStatus =
        statusData.data.find(
          (s: RequestStatus) => s.testRequestStatus === 'Đã nhận mẫu'
        ) ||
        statusData.data.find(
          (s: RequestStatus) => s._id !== '684e9057e4331a7fdfb9b12e'
        )
      if (defaultStatus) {
        setSelectedStatus(defaultStatus._id)
        setSelectedOrder(defaultStatus.order)
      }
    }
  }, [statusData, selectedStatus])

  const filteredStatuses = useMemo(
    () =>
      (statusData?.data as RequestStatus[])?.filter(
        (s) => s._id !== '684e9057e4331a7fdfb9b12e'
      ),
    [statusData]
  )

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {id}
        </span>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDetails',
      render: (bookingDetails: ServiceCase['bookingDetails']) =>
        new Date(bookingDetails.bookingDate).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ca đặt',
      dataIndex: 'bookingDetails',
      render: (bookingDetails: ServiceCase['bookingDetails']) =>
        bookingDetails.slotTime,
    },
    {
      title: 'Người xét nghiệm',
      dataIndex: 'caseMember',
      render: (caseMember: ServiceCase['caseMember']) => (
        <div>
          {caseMember.testTakers.map((taker) => (
            <div key={taker._id}>
              {taker.name} ({taker.personalId})
            </div>
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
          <span style={{ fontSize: 12, color: '#888' }}>{acc.phoneNumber}</span>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'services',
      render: (services: ServiceCase['services']) => (
        <ul style={{ paddingLeft: 20 }}>
          {services.map((s) => (
            <li key={s._id}>
              {s.sample.name} – {s.timeReturn}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: ServiceCase) => {
        const selectedStatusObj = filteredStatuses.find(
          (s) => s._id === selectedStatus
        )
        const selectedOrder = selectedStatusObj?.order ?? -1

        if (selectedOrder === 7) {
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

        if (selectedOrder === 8) {
          return <Tag color='orange'>Đang chờ duyệt kết quả</Tag>
        }

        const availableStatusOptions = filteredStatuses.filter(
          (s) => s.order > selectedOrder
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
    {
      title: '',
      key: 'details',
      render: (_: any, record: ServiceCase) => (
        <Button
          type='link'
          onClick={() => alert(`Xem chi tiết: ${record._id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📄 Hồ sơ chưa có tài liệu ADN</Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            const found = statusData?.data?.find((s) => s._id === value)
            setSelectedOrder(found?.order || null)
          }}
          style={{ width: 250 }}
          loading={loadingStatus}
        >
          {filteredStatuses?.map((s) => (
            <Select.Option key={s._id} value={s._id}>
              {s.testRequestStatus}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* {error && (
        <Alert
          type='error'
          message='Lỗi khi tải hồ sơ'
          description={(error as any)?.data?.message || 'Không rõ lỗi'}
        />
      )} */}

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={(serviceCaseData?.data as ServiceCase[]) || []}
          rowKey='_id'
          locale={{ emptyText: 'Chưa có hồ sơ nào.' }}
          pagination={{
            current: pageNumber,
            pageSize,
            total: serviceCaseData?.data?.length || 0,
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
