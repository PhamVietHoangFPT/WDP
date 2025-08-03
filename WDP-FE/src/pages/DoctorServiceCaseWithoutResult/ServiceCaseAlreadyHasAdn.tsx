import React, { useEffect, useState } from 'react'
import { Table, Select, Typography, Spin, Button } from 'antd'
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
  const [resultExists] = useState(true)
  const navigate = useNavigate()

  const { data: statusData, isLoading: loadingStatus } =
    useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })

  const { data: serviceCaseData, isLoading } =
    useGetServiceCasesWithoutAdnQuery(
      { currentStatus: selectedStatus, resultExists },
      { skip: !selectedStatus }
    )

  // Tìm ID dựa trên tên trạng thái
  useEffect(() => {
    if (statusData?.data?.length) {
      const targetStatus = statusData.data.find(
        (s: RequestStatus) => s.testRequestStatus === 'Đã có kết quả'
      )
      if (targetStatus) {
        setSelectedStatus(targetStatus._id)
      }
    }
  }, [statusData])

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
          <strong>{acc.name}</strong>
          <br />
          <PhoneOutlined /> {acc.phoneNumber}
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
          {statusData?.data
            ?.filter((s) => s.testRequestStatus === 'Đã có kết quả')
            .map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.testRequestStatus}
              </Select.Option>
            ))}
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
