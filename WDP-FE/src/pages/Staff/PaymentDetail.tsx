import React, { useEffect } from 'react'
import { Card, Typography, Descriptions, Button, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetPaymentByIdQuery } from '../../features/customer/paymentApi'

const { Title } = Typography

export default function StaffPaymentHistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useGetPaymentByIdQuery(id || '')

  useEffect(() => {
    if (error) {
      message.error('Không thể tải thông tin thanh toán')
    }
  }, [error])

  if (isLoading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>
  }

  if (!data) {
    return (
      <div style={{ padding: 24 }}>Không tìm thấy thông tin thanh toán.</div>
    )
  }

  const {
    transactionReferenceNumber,
    transactionNo,
    amount,
    payDate,
    responseCode,
    transactionStatus,
    orderInfo,
    tmnCode,
    paymentType,
  } = data

  return (
    <Card style={{ maxWidth: 700, margin: '40px auto' }}>
      <Title level={3}>Chi tiết thanh toán</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label='Mã giao dịch'>
          {transactionReferenceNumber}
        </Descriptions.Item>
        <Descriptions.Item label='Số giao dịch VNPay'>
          {transactionNo}
        </Descriptions.Item>
        <Descriptions.Item label='Số tiền'>
          {(amount / 100).toLocaleString()} VNĐ
        </Descriptions.Item>
        <Descriptions.Item label='Thời gian thanh toán'>
          {new Date(payDate).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label='Trạng thái'>
          {transactionStatus}
        </Descriptions.Item>
        <Descriptions.Item label='Mã TMN'>{tmnCode}</Descriptions.Item>
        <Descriptions.Item label='Loại thanh toán'>
          {paymentType?.paymentType}
        </Descriptions.Item>
        <Descriptions.Item label='Thông tin đơn hàng'>
          {orderInfo}
        </Descriptions.Item>
        <Descriptions.Item label='Mã phản hồi'>
          {responseCode}
        </Descriptions.Item>
      </Descriptions>
      <Button
        type='primary'
        onClick={() =>
          navigate('/staff/payment-history?pageNumber=1&pageSize=5')
        }
        style={{ marginTop: 24 }}
      >
        Quay lại danh sách
      </Button>
    </Card>
  )
}
