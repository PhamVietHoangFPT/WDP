import React from 'react'
import { Card, Table, Typography, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGetPaymentListQuery } from '../../features/customer/paymentApi'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import HeaderCus from '../../components/layout/Header/HeaderCus'

const { Title } = Typography

export default function PaymentHistory() {
  const navigate = useNavigate()

  // 👉 Lấy accountId từ token
  const token = Cookies.get('userToken')
  const decoded: any = token ? jwtDecode(token) : null
  const accountId = decoded?.id || decoded?._id

  const { data, isLoading } = useGetPaymentListQuery({
    pageSize: 5,
    pageNumber: 1,
    accountId, // ✅ truyền nếu API có lọc theo account
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
      render: (status: string) =>
        status?.toLowerCase().includes('thành công')
          ? 'Thành công'
          : 'Thất bại',
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
      <HeaderCus />
      <Card style={{ margin: '40px auto' }}>
        <Title level={3}>Lịch sử thanh toán</Title>
        <Table
          loading={isLoading}
          rowKey='_id'
          dataSource={data?.data || []}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  )
}
