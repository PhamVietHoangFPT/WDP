import { Table, Typography, Button, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { MailOutlined, PhoneOutlined } from '@ant-design/icons'

import { useGetServiceCasesWithoutResultQuery } from '../../features/certifier/certifierApi'

const { Title } = Typography

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
  const currentStatus = '684e9057e4331a7fdfb9b12d' // Chờ duyệt kết quả

  const { data: serviceCaseData, isLoading } =
    useGetServiceCasesWithoutResultQuery(
      { currentStatus, resultExists: false },
      { skip: !currentStatus }
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
      title: 'Bác sĩ xét nghiệm',
      dataIndex: 'doctorDetails',
      render: (doctor: ServiceCase['doctorDetails']) => (
        <div>
          <div>
            <strong>{doctor.name}</strong>
          </div>
          <div>
            <MailOutlined /> {doctor.email}
          </div>
          <div>
            <PhoneOutlined /> {doctor.phoneNumber}
          </div>
        </div>
      ),
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
          <PhoneOutlined />
          {acc.phoneNumber}
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

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📄 Hồ sơ chờ duyệt kết quả ADN</Title>

      {isLoading ? (
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
