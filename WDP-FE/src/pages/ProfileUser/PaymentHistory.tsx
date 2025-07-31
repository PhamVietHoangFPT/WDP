import {
  Card,
  Table,
  Typography,
  Button,
  Pagination,
  Tag,
  Tooltip,
  Select,
  DatePicker,
  Space,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetPaymentListQuery } from '../../features/customer/paymentApi'
import { useState } from 'react'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export default function PaymentHistory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '5'

  const { data, isLoading } = useGetPaymentListQuery({
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
  })

  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<any>(null)

  const filteredData = (data?.data || []).filter((item) => {
    let statusMatch = true
    let dateMatch = true

    if (statusFilter) {
      statusMatch = item.transactionStatus === statusFilter
    }

    if (dateRange) {
      const date = dayjs(item.payDate)
      dateMatch =
        date.isAfter(dateRange[0], 'day') && date.isBefore(dateRange[1], 'day')
    }

    return statusMatch && dateMatch
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
        date ? dayjs(date).format('HH:mm DD-MM-YYYY') : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
      align: 'center',
      render: (status: string, record: { responseCode?: string }) => {
        if (!status) {
          return <Tag color='default'>Chưa xác định</Tag>
        }

        const lowerStatus = status.toLowerCase()
        let color = 'green'
        if (lowerStatus.includes('lỗi') || lowerStatus.includes('không')) {
          color = 'red'
        } else if (lowerStatus.includes('chờ')) {
          color = 'blue'
        }

        return record.responseCode && record.responseCode !== status ? (
          <Tooltip title={`Lý do: ${record.responseCode}`}>
            <Tag color={color}>{status}</Tag>
          </Tooltip>
        ) : (
          <Tag color={color}>{status}</Tag>
        )
      },
      filters: [
        { text: 'Giao dịch thành công', value: 'Giao dịch thành công' },
        { text: 'LGiao dịch bị lỗi', value: 'Giao dịch bị lỗi' },
        {
          text: 'Giao dịch không thành công',
          value: 'Giao dịch không thành công',
        },
      ],
      onFilter: (value, record) => record.transactionStatus === value,
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
      <Card
        style={{
          margin: '40px auto',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3}>Lịch sử thanh toán</Title>

        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            allowClear
            placeholder='Lọc theo trạng thái'
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 220 }}
          >
            <Option value='Giao dịch thành công'>Giao dịch thành công</Option>
            <Option value='Giao dịch bị lỗi'>Giao dịch bị lỗi</Option>
            <Option value='Giao dịch không thành công'>
              Giao dịch không thành công
            </Option>
          </Select>

          <RangePicker
            format='DD-MM-YYYY'
            onChange={(dates) => setDateRange(dates)}
          />
        </Space>

        <Table
          loading={isLoading}
          rowKey='_id'
          dataSource={filteredData}
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
