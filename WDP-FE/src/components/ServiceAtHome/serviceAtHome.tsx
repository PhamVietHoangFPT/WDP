import React, { useState } from 'react'
import { Form, message, Radio, Switch } from 'antd'
import { useGetTestTakersQuery } from '../../features/customer/testTakerApi'
import type { TestTaker } from '../../types/testTaker'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useCreateCaseMemberMutation } from '../../features/caseMembers/caseMemebers'
import { useCreateServiceCaseMutation } from '../../features/serviceCase/serviceCase'
import { useCreateServiceCasePaymentMutation } from '../../features/vnpay/vnpayApi'
import { useCreateBookingMutation } from '../../features/customer/bookingApi'
import SingleServiceForm from './SingleServiceForm'
import MultipleServicesForm from './MultipleServicesForm'
import { useCreateKitShipmentMutation } from '../../features/kitShipment/kitShipmentAPI'
interface TestTakerListResponse {
  data: {
    data: TestTaker[]
  }
  isLoading: boolean
}


const ServiceAtHomeForm: React.FC = () => {

  const accountId = Cookies.get('userData')
    ? JSON.parse(Cookies.get('userData') as string).id
    : undefined
  const [form] = Form.useForm()
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  )
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [totalFee, setTotalFee] = useState<number | null>(null) // Thêm state để lưu totalFee
  const [isSingle, setIsSingle] = useState<boolean>(true)
  const [showAgnate, setShowAgnate] = useState<boolean>(true)
  const [isSelfSampling, setIsSelfSampling] = useState<boolean>(false)
  const [createKitShipment] = useCreateKitShipmentMutation()

  const [testTakerCount] = useState(2)
  const { data } = useGetTestTakersQuery<TestTakerListResponse>({
    accountId: accountId,
    pageSize: 100,
    pageNumber: 1,
  })


  // Lấy danh sách dịch vụ cho việc chọn
  const { data: serviceListData, isLoading: isLoadingServices, error: serviceError } = useGetServiceListQuery({
    pageNumber: 1,
    pageSize: 100,
    isAdministration: false,
    isSelfSampling: isSelfSampling,
    isAgnate: showAgnate, // Sử dụng API query theo isAgnate
  }, {
    refetchOnMountOrArgChange: true, // Refetch khi component mount hoặc argument thay đổi
  })

  const serviceList = serviceListData?.data || []
  const [createCaseMember, { isLoading: isCreating }] =
    useCreateCaseMemberMutation()
  const [createServiceCase] = useCreateServiceCaseMutation()
  const [createBooking] = useCreateBookingMutation()
  const [createPaymentUrl] = useCreateServiceCasePaymentMutation()
  const [isDisabled, setIsDisabled] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const dataTestTaker = data?.data || []
  const selectedTestTakers = Form.useWatch([], form)

  const handleConfirmBooking = ({
    slotId,
    shippingFee,
    totalFee,
  }: {
    slotId: string
    shippingFee: number
    totalFee: number // Thêm totalFee vào parameters
  }) => {
    form.setFieldsValue({ slot: slotId })
    console.log(shippingFee, totalFee)
    setShippingFee(shippingFee)
    setTotalFee(totalFee) // Lưu totalFee vào state
  }

  const getAvailableTestTakers = (currentField: string) => {
    const selectedIds = Object.keys(selectedTestTakers || {})
      .filter((key) => key.startsWith('testTaker') && key !== currentField)
      .map((key) => selectedTestTakers[key])
      .filter((id) => id)
    return dataTestTaker.filter((taker) => !selectedIds.includes(taker._id))
  }

  const isServiceDisabled = (serviceId: string, currentServiceField: string) => {
    const selectedServiceIds = Object.keys(selectedTestTakers || {})
      .filter((key) => key.startsWith('service') && key !== currentServiceField)
      .map((key) => selectedTestTakers[key])
      .filter((id) => id)
    return selectedServiceIds.includes(serviceId)
  }

  const onFinish = async (values: any) => {
    const token = Cookies.get('userToken')
    if (!token) return message.error('Bạn cần đăng nhập')
    form.resetFields() // Reset form fields after successful submission
    const decoded: any = jwtDecode(token)
    const accountId = decoded?.id || decoded?._id
    if (!accountId) return message.error('Không xác định được tài khoản')

    const testTakers = [
      values.testTaker1,
      values.testTaker2,
    ].filter((id) => id)

    const services = isSingle
      ? [
        values.service1,
        values.service2,
      ].filter((id) => id)
      : values.sharedServices || [] // Sử dụng sharedServices khi isSingle = false

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
        service: services,
        address: selectedAddressId,
        note: '',
        isAtHome: !serviceListData?.data[0]?.isAdministration,
        isSelfSampling: serviceListData?.data[0]?.isSelfSampling,
        isSingleService: isSingle,
      }
      const caseMember = await createCaseMember({ data }).unwrap()
      const caseMemberId = caseMember?.data?._id || caseMember?._id

      if (!caseMemberId) {
        throw new Error('Không thể lấy caseMemberId')
      }

      if (isSelfSampling) {
        const response = await createKitShipment({ caseMember: caseMemberId }).unwrap()
        console.log('Kit shipment created:', response)
      }

      const serviceCaseData = {
        caseMember: caseMemberId,
        shippingFee: shippingFee,
        totalFee: totalFee, // Sử dụng totalFee từ BookingComponent
      }
      const serviceCase = await createServiceCase({
        data: serviceCaseData,
      }).unwrap()
      console.log('serviceCase:', serviceCase)
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
        <div
          style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Radio.Group
              onChange={(e) => setIsSingle(e.target.value)}
              value={isSingle}
            >
              <Radio value={true}>Single service</Radio>
              <Radio value={false}>Multiple services</Radio>
            </Radio.Group>
          </div>


          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <p style={{ marginTop: "0", marginRight: "8px" }}>Chọn bên xét nghiệm:</p>
            <Switch
              checked={showAgnate}
              onChange={(checked) => setShowAgnate(checked)}
              checkedChildren="Bên nội"
              unCheckedChildren="Bên ngoại"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <p style={{ marginTop: "0", marginRight: "8px" }}>Chọn hình thức lấy mẫu:</p>
            <Switch
              checked={isSelfSampling}
              onChange={(checked) => setIsSelfSampling(checked)}
              checkedChildren="Không tự lấy mẫu"
              unCheckedChildren="Tự lấy mẫu"
            />
          </div>
        </div>
        {isSingle && (
          <SingleServiceForm
            form={form}
            onFinish={onFinish}
            testTakerCount={testTakerCount}
            serviceList={serviceList}
            isLoadingServices={isLoadingServices}
            serviceError={serviceError}
            selectedTestTakers={selectedTestTakers}
            isCreating={isCreating}
            isDisabled={isDisabled}
            isAgreed={isAgreed}
            getAvailableTestTakers={getAvailableTestTakers}
            isServiceDisabled={isServiceDisabled}
            handleConfirmBooking={handleConfirmBooking}
            setSelectedSlotId={setSelectedSlotId}
            selectedSlotId={selectedSlotId}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            setIsDisabled={setIsDisabled}
            setIsAgreed={setIsAgreed}
          />
        )}
        {!isSingle && (
          <MultipleServicesForm
            form={form}
            onFinish={onFinish}
            testTakerCount={testTakerCount}
            serviceList={serviceList}
            isLoadingServices={isLoadingServices}
            serviceError={serviceError}
            selectedTestTakers={selectedTestTakers}
            isCreating={isCreating}
            isDisabled={isDisabled}
            isAgreed={isAgreed}
            getAvailableTestTakers={getAvailableTestTakers}
            handleConfirmBooking={handleConfirmBooking}
            setSelectedSlotId={setSelectedSlotId}
            selectedSlotId={selectedSlotId}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            setIsDisabled={setIsDisabled}
            setIsAgreed={setIsAgreed}
          />
        )}
      </div>
    </div>
  )
}

export default ServiceAtHomeForm
