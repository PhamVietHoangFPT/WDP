import { Card, Table, Typography, Button, Pagination, Tag } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetServiceCasesListQuery } from '../../features/customer/paymentApi'
import HeaderCus from '../../components/layout/Header/HeaderCus'

const { Title } = Typography

export default function ServiceCase() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '5'

  const { data, isLoading } = useGetServiceCasesListQuery({
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
  })

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Số tiền (VNĐ)',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (amount: number) =>
        typeof amount === 'number'
          ? amount.toLocaleString('vi-VN')
          : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: ['currentStatus', 'testRequestStatus'],
      key: 'status',
      render: (status: string) => {
        const lowerStatus = status?.toLowerCase() || ''
        let color = 'default'

        if (lowerStatus.includes('thất bại') || lowerStatus.includes('hủy')) {
          color = 'red'
        } else if (status?.includes('Chờ thanh toán')) {
          color = 'orange'
        } else if (lowerStatus.includes('đã') ) {
          color = 'green'
        }

        return <Tag color={color}>{status || '—'}</Tag>
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
        <Button onClick={() => navigate(`/service-case-customer/${record._id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div>
      <HeaderCus />
      <Card style={{ margin: '40px auto' }}>
        <Title level={3}>Lịch sử trường hợp dịch vụ</Title>
        <Table
          loading={isLoading}
          rowKey="_id"
          dataSource={data?.data || []}
          columns={columns}
          pagination={false}
        />
        <Pagination
          current={Number(pageNumber)}
          pageSize={Number(pageSize)}
          total={data?.pagination?.totalItems || 0}
          onChange={(page, size) => {
            navigate(`/service-case-customer?pageNumber=${page}&pageSize=${size}`)
          }}
          showSizeChanger
          showTotal={(total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} hồ sơ`
          }
          pageSizeOptions={['5', '10', '20']}
          style={{
            marginTop: '20px',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        />
      </Card>
    </div>
  )
}
