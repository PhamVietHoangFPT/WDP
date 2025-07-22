import { Card, Table, Typography, Button, Pagination, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGetPaymentListQuery } from '../../features/customer/paymentApi'
import { useSearchParams } from 'react-router-dom'

const { Title } = Typography

export default function PaymentHistory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '5'

  const { data, isLoading } = useGetPaymentListQuery({
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
  })

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionReferenceNumber',
      key: 'transactionReferenceNumber',
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'tmnCode',
      key: 'tmnCode',
    },
    {
      title: 'Số tiền (VNĐ)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) =>
        typeof amount === 'number'
          ? (amount / 100).toLocaleString('vi-VN')
          : '—',
    },
    {
      title: 'Thời gian',
      dataIndex: 'payDate',
      key: 'payDate',
      render: (date: string) =>
        date ? new Date(date).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'responseCode',
      key: 'responseCode',
      render: (status: string) => {
        // Chuyển status về dạng chữ thường để so sánh không phân biệt hoa/thường
        const lowerStatus = status.toLowerCase()
        if (lowerStatus.includes('không ')) {
          return <Tag color='red'>{status}</Tag>
        } else {
          return <Tag color='green'>{status}</Tag>
        }
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
        <Button onClick={() => navigate(`/payment-history/${record._id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ margin: '40px auto' }}>
        <Title level={3}>Lịch sử thanh toán</Title>
        <Table
          loading={isLoading}
          rowKey='_id'
          dataSource={data?.data || []}
          columns={columns}
          pagination={false}
        />
        <Pagination
          current={Number(pageNumber)}
          pageSize={Number(pageSize)}
          total={data?.pagination?.totalItems || 0}
          onChange={(page, size) => {
            navigate(`/payment-history?pageNumber=${page}&pageSize=${size}`)
          }}
          showSizeChanger
          showTotal={(total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} lịch sử thanh toán`
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
