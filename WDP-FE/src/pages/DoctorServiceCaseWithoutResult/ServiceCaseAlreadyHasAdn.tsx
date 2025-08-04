import React, { useEffect, useMemo, useState } from 'react'
import { Table, Select, Typography, Spin, Button, Result, List } from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
} from '../../features/doctor/doctorAPI'
import { PhoneOutlined } from '@ant-design/icons'

import { useNavigate } from 'react-router-dom'

const { Title } = Typography

interface ServiceCase {
  _id: string
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
    }[]
  }
  accountDetails: {
    name: string
    phoneNumber: string
  }
  services: {
    _id: string
    sample: {
      name: string
    }
    timeReturn: string
  }[]
  currentStatus: {
    testRequestStatus: string
  }
}

interface RequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

export default function ServiceCaseAlreadyHasAdn() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [resultExists] = useState(true)
  const navigate = useNavigate()
  const {
    data: statusData,
    isLoading: loadingStatus,
    isError,
    error,
  } = useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })

  const { data: serviceCaseData, isLoading } =
    useGetServiceCasesWithoutAdnQuery(
      { currentStatus: selectedStatus, resultExists },
      { skip: !selectedStatus }
    )

  const allStatuses = useMemo(
    () => (statusData?.data as RequestStatus[])?.slice(2) || [],
    [statusData]
  )

  useEffect(() => {
    // Chỉ chạy khi có dữ liệu trạng thái và chưa có trạng thái nào được chọn
    if (statusData?.data?.length && !selectedStatus) {
      // Ưu tiên tìm "Chờ duyệt kết quả" làm mặc định
      const defaultStatus = statusData.data.find(
        (s: RequestStatus) => s.testRequestStatus === 'Chờ duyệt kết quả'
      )
      // Nếu không tìm thấy, lấy trạng thái đầu tiên trong danh sách
      const fallbackStatus = statusData.data[2]

      const statusToSet = defaultStatus || fallbackStatus

      if (statusToSet) {
        setSelectedStatus(statusToSet._id)
        setSelectedOrder(statusToSet.order)
      }
    }
  }, [statusData, selectedStatus])

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
      title: '',
      key: 'details',
      render: (_: any, record: ServiceCase) => (
        <Button
          type='primary'
          size='small'
          onClick={() =>
            navigate(`/doctor/view-adn-documentation/${record._id}`, {
              state: { serviceCase: record },
            })
          }
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  const FilterSection = () => (
    <div style={{ marginBottom: 16 }}>
      <Select
        value={selectedStatus}
        onChange={(value) => {
          const found = allStatuses.find((s) => s._id === value)
          setSelectedStatus(value)
          setSelectedOrder(found?.order || null)
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
      <Title level={3}>📑 Hồ sơ đã có tài liệu ADN</Title>
      <FilterSection />
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={serviceCaseData?.data || []}
          rowKey='_id'
          locale={{ emptyText: 'Chưa có hồ sơ nào có kết quả ADN.' }}
        />
      )}
    </div>
  )
}
