import React, { useEffect, useMemo, useState } from 'react'
import { Table, Typography, Select, Tag, Spin, Alert, Button } from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
} from '../../features/doctor/doctorAPI'

const { Title } = Typography

// Interfaces
interface ServiceCase {
  _id: string
  currentStatus: string
  bookingDate: string
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
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const resultExists = false

  const { data: statusData, isLoading: loadingStatus } =
    useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })

  const {
    data: serviceCaseData,
    isLoading,
    error,
  } = useGetServiceCasesWithoutAdnQuery(
    { currentStatus: selectedStatus, resultExists },
    { skip: !selectedStatus }
  )

  useEffect(() => {
    if (statusData?.data?.length && !selectedStatus) {
      const defaultStatus = statusData.data.find(
        (s: RequestStatus) => s._id !== '684e9057e4331a7fdfb9b12e'
      )
      if (defaultStatus) setSelectedStatus(defaultStatus._id)
    }
  }, [statusData, selectedStatus])

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
      title: 'Trạng thái',
      dataIndex: 'currentStatus',
      render: (text: string) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
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

  const filteredStatuses = useMemo(
    () =>
      (statusData?.data as RequestStatus[])?.filter(
        (s) => s._id !== '684e9057e4331a7fdfb9b12e'
      ),
    [statusData]
  )

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📄 Hồ sơ chưa có tài liệu ADN</Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
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

      {error && (
        <Alert
          type='error'
          message='Lỗi khi tải hồ sơ'
          description={(error as any)?.data?.message || 'Không rõ lỗi'}
        />
      )}

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={(serviceCaseData?.data as ServiceCase[]) || []}
          rowKey='_id'
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
