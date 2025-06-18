import React from 'react'
import { useLocation } from 'react-router-dom'
import { Card, Typography, Button, message } from 'antd'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import { useCreateBookingMutation } from '../../features/customer/bookingApi'
import { useCreatePaymentUrlMutation } from '../../features/vnpay/vnpayApi'
import { useGetFacilitiesListQuery } from '../../features/admin/facilitiesAPI'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function PaymentPage() {
  const location = useLocation()
  const [createBooking] = useCreateBookingMutation()
  const [createPaymentUrl] = useCreatePaymentUrlMutation()

  const { data: facilitiesData } = useGetFacilitiesListQuery({
    pageNumber: 1,
    pageSize: 50,
  })

  const slot = location.state?.slot
  if (!slot)
    return <div style={{ padding: 24 }}>Không có thông tin lịch hẹn!</div>

  const facilityName =
    facilitiesData?.data?.find(
      (f) => f._id === slot.facility?._id || f._id === slot.facilityId
    )?.facilityName || 'Không rõ'

  const handlePayment = async () => {
    const token = Cookies.get('userToken')
    if (!token) return message.error('Bạn cần đăng nhập')

    const decoded: any = jwtDecode(token)
    const accountId = decoded?.id || decoded?._id
    if (!accountId) return message.error('Không xác định được tài khoản')

    try {
      const bookingRes = await createBooking({
        slot: slot._id,
        account: String(accountId),
        note: 'Đặt lịch hẹn xét nghiệm ADN',
      }).unwrap()

      const bookingId = bookingRes?.data?._id || bookingRes?._id
      if (!bookingId) throw new Error('Không thể tạo booking')

      const redirectUrl = await createPaymentUrl({
        vnp_Amount: 1000000,
        vnp_TxnRef: bookingId,
        vnp_OrderInfo: `Thanh toán đơn hàng #${bookingId}`,
        // vnp_ReturnUrl: 'http://localhost:5173/payment-success/',
      }).unwrap()
      if (typeof redirectUrl === 'string' && redirectUrl.startsWith('http')) {
        window.open(redirectUrl, '_blank')
      } else {
        throw new Error('Không nhận được URL thanh toán')
      }
    } catch (err: any) {
      console.error('❌ Lỗi:', err)
      message.error('Thanh toán thất bại hoặc không thể đặt lịch')
    }
  }

  return (
    <Card style={{ maxWidth: 500, margin: '40px auto' }}>
      <Title level={3}>Xác nhận đặt lịch</Title>
      <Text strong>Cơ sở:</Text> {facilityName}
      <br />
      <Text strong>Thời gian:</Text> {dayjs(slot.slotDate).format('DD/MM/YYYY')}{' '}
      – {slot.startTime} đến {slot.endTime}
      <br />
      <Button type='primary' onClick={handlePayment} style={{ marginTop: 24 }}>
        Đặt lịch & Thanh toán
      </Button>
    </Card>
  )
}
