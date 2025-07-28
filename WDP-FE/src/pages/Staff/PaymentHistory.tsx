import { Card, Table, Typography, Button, Pagination, Tag, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGetPaymentListQuery } from '../../features/customer/paymentApi'
import { useSearchParams } from 'react-router-dom'

const { Title } = Typography

export default function StaffPaymentHistory() {
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
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
      align: 'center',
      // ✅ Sửa lại signature để nhận cả `status` và `record`
      render: (status: string, record: { responseCode?: string }) => {
        // Case 1: Không có trạng thái
        if (!status) {
          return <Tag color='default'>Chưa xác định</Tag>
        }

        // Logic chọn màu vẫn như cũ
        const lowerStatus = status.toLowerCase()
        let color = 'green'
        if (lowerStatus.includes('lỗi') || lowerStatus.includes('hủy')) {
          color = 'red'
        } else if (lowerStatus.includes('chờ')) {
          color = 'blue'
        }

        // ✅ Dùng Tooltip để hiển thị lý do (responseCode) khi người dùng di chuột vào
        // Nếu không có responseCode, chỉ hiển thị Tag bình thường
        if (record.responseCode && record.responseCode !== status) {
          return (
            <Tooltip title={`Lý do: ${record.responseCode}`}>
              <Tag color={color}>{status}</Tag>
            </Tooltip>
          )
        }

        // Trả về Tag nếu không có responseCode hoặc responseCode trùng với status
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          onClick={() => navigate(`/staff/payment-history/${record._id}`)}
        >
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
            navigate(
              `/staff/payment-history?pageNumber=${page}&pageSize=${size}`
            )
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
