import React, { useState } from 'react'
import { Row, Col, Form, Select, Button, Space, message } from 'antd'
import { useGetTestTakersQuery } from '../../features/customer/testTakerApi'
import type { TestTaker } from '../../types/testTaker'
import type { Service } from '../../types/service'
import { useGetServiceDetailQuery } from '../../features/service/serviceAPI'
import { useParams } from 'react-router-dom'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useCreateCaseMemberMutation } from '../../features/caseMembers/caseMemebers'
import { useCreateServiceCaseMutation } from '../../features/serviceCase/serviceCase'
import { useCreateServiceCasePaymentMutation } from '../../features/vnpay/vnpayApi'
import BookingComponent from '../../pages/BookingPage/BookingPage'
import { useCreateBookingMutation } from '../../features/customer/bookingApi'
interface TestTakerListResponse {
  data: {
    data: TestTaker[]
  }
  isLoading: boolean
}
interface ServiceDetailResponse {
  data: Service
}

const ServiceAtHomeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const accountId = Cookies.get('userData')
    ? JSON.parse(Cookies.get('userData') as string).id
    : undefined
  const [form] = Form.useForm()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  )
  const [testTakerCount, setTestTakerCount] = useState(2)
  const { data } = useGetTestTakersQuery<TestTakerListResponse>({
    accountId: accountId,
    pageSize: null,
    pageNumber: null,
  })
  const { data: serviceDetail } =
    useGetServiceDetailQuery<ServiceDetailResponse>(id)
  const [createCaseMember, { isLoading: isCreating }] =
    useCreateCaseMemberMutation()
  const [createServiceCase] = useCreateServiceCaseMutation()
  const [createBooking] = useCreateBookingMutation()
  const [createPaymentUrl] = useCreateServiceCasePaymentMutation()
  const dataTestTaker = data?.data || []
  const selectedTestTakers = Form.useWatch([], form)

  const handleConfirmBooking = ({
    slotId,
    shippingFee,
  }: {
    slotId: string
    shippingFee: number
  }) => {
    form.setFieldsValue({ slot: slotId })
    form.setFieldsValue({ extraPrice: shippingFee })
  }

  const addTestTaker = () => {
    if (testTakerCount < 3) {
      setTestTakerCount(testTakerCount + 1)
    }
  }

  const removeTestTaker = () => {
    if (testTakerCount === 3) {
      setTestTakerCount(2)
      form.setFieldsValue({ testTaker3: undefined })
    }
  }

  const getAvailableTestTakers = (currentField: string) => {
    const selectedIds = Object.keys(selectedTestTakers || {})
      .filter((key) => key.startsWith('testTaker') && key !== currentField)
      .map((key) => selectedTestTakers[key])
      .filter((id) => id)
    return dataTestTaker.filter((taker) => !selectedIds.includes(taker._id))
  }

  const onFinish = async (values: any) => {
    const token = Cookies.get('userToken')
    if (!token) return message.error('Bạn cần đăng nhập')

    const decoded: any = jwtDecode(token)
    const accountId = decoded?.id || decoded?._id
    if (!accountId) return message.error('Không xác định được tài khoản')
    const testTakers = [
      values.testTaker1,
      values.testTaker2,
      values.testTaker3,
    ].filter((id) => id)

    const { slot } = values

    if (!slot) {
      return message.error('Vui lòng chọn và xác nhận lịch hẹn.')
    }

    try {
      const bookingRes = await createBooking({
        slot: slot,
        account: String(accountId),
        note: 'Đặt lịch hẹn xét nghiệm ADN',
      }).unwrap()
      console.log('bookingRes:', bookingRes)

      const bookingId = bookingRes._doc?._id || bookingRes?._id

      const data = {
        testTaker: testTakers,
        booking: bookingId,
        service: id,
        note: '',
        isAtHome: true,
        isSelfSampling: false,
        address: selectedAddressId,
      }
      const caseMember = await createCaseMember({ data }).unwrap()
      const caseMemberId = caseMember?.data?._id || caseMember?._id
      console.log('caseMemberId:', caseMemberId)

      if (!caseMemberId) {
        throw new Error('Không thể lấy caseMemberId')
      }

      const serviceCaseData = { caseMember: caseMemberId }
      const serviceCase = await createServiceCase({
        data: serviceCaseData,
      }).unwrap()
      const serviceCaseId = serviceCase?.data?._id || serviceCase?._id
      console.log('serviceCaseId:', serviceCaseId)

      if (!serviceCaseId) {
        throw new Error('Không thể lấy serviceCaseId')
      }

      const paymentResponse = await createPaymentUrl({ serviceCaseId }).unwrap()
      const redirectUrl = paymentResponse
      console.log('Redirect URL:', redirectUrl)
      window.open(redirectUrl, '_blank')

      message.success('Đăng ký thành công')
    } catch (err: any) {
      console.error('Chi tiết lỗi từ API:', err.data)
      message.error(err.data?.title || err.data?.message || 'Đăng ký thất bại')
    }
  }

  return (
    <div
      style={{
        background: '#EEEEEE',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <p style={{ color: 'black' }}>
            Xét nghiệm huyết thống bên{' '}
            {serviceDetail?.isAgnate ? 'nội' : 'ngoại'}
          </p>
          <p style={{ fontStyle: 'italic' }}>
            Loại mẫu: {serviceDetail?.sample?.name}
          </p>
        </div>

        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}
        >
          <Row gutter={16}>
            {[...Array(testTakerCount)].map((_, index) => {
              const fieldName = `testTaker${index + 1}`
              return (
                <Col span={24} key={fieldName}>
                  <Form.Item
                    name={fieldName}
                    label={`Người xét nghiệm ${index + 1}`}
                    rules={[
                      {
                        required: true,
                        message: `Vui lòng chọn người ${index + 1}`,
                      },
                    ]}
                  >
                    <Select
                      placeholder={`Chọn người xét nghiệm ${index + 1}`}
                      options={getAvailableTestTakers(fieldName).map(
                        (taker) => ({
                          value: taker._id,
                          label: taker.name || `Test Taker ${taker._id}`,
                        })
                      )}
                    />
                  </Form.Item>
                </Col>
              )
            })}
            <Col span={24}>
              <Space style={{ width: '100%', marginBottom: 16 }}>
                {testTakerCount < 3 && (
                  <Button type='dashed' onClick={addTestTaker} block>
                    Thêm người xét nghiệm
                  </Button>
                )}
                {testTakerCount === 3 && (
                  <Button type='dashed' danger onClick={removeTestTaker} block>
                    Remove Test Taker 3
                  </Button>
                )}
              </Space>
            </Col>
            <Col span={24}>
              <Form.Item
                name='slot'
                rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
                style={{ placeSelf: 'center' }}
              >
                <BookingComponent
                  onConfirmBooking={handleConfirmBooking} // Hàm xác nhận cuối cùng
                  onSelectSlot={setSelectedSlotId} // ✅ Hàm để chọn slot
                  selectedSlotId={selectedSlotId} // ✅ Giá trị slot đang được chọn
                  serviceDetail={serviceDetail}
                  addressId={selectedAddressId}
                  setAddressId={setSelectedAddressId}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <p style={{ fontStyle: 'italic', color: 'gray' }}>
                * Các dịch vụ tại nhà chỉ có thể được sử dụng với mục đích dân
                sự
              </p>
            </Col>
            <Col span={24}>
              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  loading={isCreating}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  )
}

export default ServiceAtHomeForm
