'use client'

import React, { useEffect, useState } from 'react'
import { Card, Typography, Button, message } from 'antd'
import { useCreateBookingPaymentHistoryMutation } from '../../features/customer/paymentApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
const { Title, Text } = Typography

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'success' | 'error' | 'processing'>(
    'processing'
  )
  const [createBookingPaymentHistory] = useCreateBookingPaymentHistoryMutation()

  useEffect(() => {
    const rawData: Record<string, string> = Object.fromEntries(
      searchParams.entries()
    )

    console.log('🔍 VNPay Query Params:', rawData)

    const responseCode = rawData.vnp_ResponseCode

    if (!responseCode) {
      message.error('Thiếu thông tin thanh toán từ VNPay')
      setStatus('error')
      return
    }

    const payload = {
      ...rawData,
    }

    createBookingPaymentHistory(payload)
      .unwrap()
      .then(() => {
        setStatus(responseCode === '00' ? 'success' : 'error')
      })
      .catch((err) => {
        console.error('❌ Không thể lưu trạng thái thanh toán:', err)
        message.error('Không thể cập nhật trạng thái thanh toán')
        setStatus('error')
      })
  }, [searchParams, createBookingPaymentHistory])

  const renderContent = () => {
    if (status === 'processing') {
      return <Text>Đang xử lý thanh toán...</Text>
    }

    if (status === 'success') {
      return (
        <>
          <Title level={3}>🎉 Thanh toán thành công!</Title>
          <Text>Chúng tôi đã nhận được thanh toán của bạn. Xin cảm ơn!</Text>
        </>
      )
    }

    return (
      <>
        <Title level={3} type='danger'>
          ❌ Thanh toán thất bại!
        </Title>
        <Text type='secondary'>
          Giao dịch không thành công hoặc bị từ chối.
        </Text>
      </>
    )
  }

  return (
    <Card style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
      {renderContent()}
      <Button
        type='primary'
        onClick={() => navigate('/')}
        style={{ marginTop: 24 }}
      >
        Về trang chủ
      </Button>
    </Card>
  )
}
