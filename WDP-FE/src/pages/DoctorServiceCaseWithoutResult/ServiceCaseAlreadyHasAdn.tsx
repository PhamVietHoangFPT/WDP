import React, { useEffect, useState } from 'react'
import { Table, Select, Typography, Spin, Button } from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
} from '../../features/doctor/doctorAPI'

const { Title } = Typography

interface ServiceCase {
  _id: string
  bookingDate: string
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

export default function ServiceCaseAlreadyHasAdn() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [resultExists] = useState(true)

  const { data: statusData, isLoading: loadingStatus } =
    useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })

  const { data: serviceCaseData, isLoading } =
    useGetServiceCasesWithoutAdnQuery(
      { currentStatus: selectedStatus, resultExists },
      { skip: !selectedStatus }
    )

  useEffect(() => {
    setSelectedStatus('684e9057e4331a7fdfb9b12e') // Mặc định chọn trạng thái "Đã có kết quả"
  }, [])

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
      title: 'Trạng thái',
      dataIndex: ['currentStatus', 'testRequestStatus'],
      render: (text: string) => <span style={{ color: 'green' }}>{text}</span>,
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
      <Title level={3}>📑 Hồ sơ đã có tài liệu ADN</Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 250 }}
          loading={loadingStatus}
        >
          <Select.Option value='684e9057e4331a7fdfb9b12e'>
            Đã có kết quả
          </Select.Option>
        </Select>
      </div>

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
