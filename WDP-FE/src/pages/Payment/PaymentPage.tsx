import { useLocation } from 'react-router-dom'
import { Card, Typography, Button, message } from 'antd'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import { useCreateBookingMutation } from '../../features/customer/bookingApi'
import { useCreateBookingPaymentMutation } from '../../features/vnpay/vnpayApi'
import { useGetFacilitiesListQuery } from '../../features/admin/facilitiesAPI'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function PaymentPage() {
  const location = useLocation()
  const [createBooking] = useCreateBookingMutation()
  const [createPaymentUrl] = useCreateBookingPaymentMutation()

  const { data: facilitiesData } = useGetFacilitiesListQuery({
    pageNumber: 1,
    pageSize: 50,
  })

  const slot = location.state?.slot
  if (!slot)
    return <div style={{ padding: 24 }}>Không có thông tin lịch hẹn!</div>

  const facilityName =
    facilitiesData?.data?.find(
      (f: any) => f._id === slot.facility?._id || f._id === slot.facilityId
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
      const bookingId = bookingRes._doc?._id || bookingRes?._id
      if (!bookingId) throw new Error('Không thể tạo booking')
      const redirectUrl = await createPaymentUrl({
        bookingId: bookingId,
      }).unwrap()
      window.open(redirectUrl, '_blank')
    } catch (err: any) {
      console.error('❌ Lỗi:', err)
      message.error(
        err.data?.message || 'Đặt lịch thất bại, vui lòng thử lại sau!'
      )
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
