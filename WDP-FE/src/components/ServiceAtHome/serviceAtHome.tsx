import React, { useState } from 'react'
import { Row, Col, Form, Select, Button, message, Radio, Card, Typography, Tag, Space, Statistic, Switch } from 'antd'
import { useGetTestTakersQuery } from '../../features/customer/testTakerApi'
import type { TestTaker } from '../../types/testTaker'
import type { Service } from '../../types/service'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
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
    isSelfSampling: false,
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

  const isServiceDisabled = (serviceId: string, currentField: string) => {
    const selectedServiceIds = Object.keys(selectedTestTakers || {})
      .filter((key) => key.startsWith('service') && key !== currentField)
      .map((key) => selectedTestTakers[key])
      .filter((id) => id)
    return selectedServiceIds.includes(serviceId)
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
    ].filter((id) => id)

    const services = [
      values.service1,
      values.service2,
    ].filter((id) => id)
    console.log(services)

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
      console.log('caseMember:', caseMember)
      const caseMemberId = caseMember?.data?._id || caseMember?._id
      console.log('caseMemberId:', caseMemberId)

      if (!caseMemberId) {
        throw new Error('Không thể lấy caseMemberId')
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
        </div>
        {isSingle && (
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}
          >
            <Row gutter={16}>
              {[...Array(testTakerCount)].map((_, index) => {
                const testTakerFieldName = `testTaker${index + 1}`
                const serviceFieldName = `service${index + 1}`
                return (
                  <Col span={24} key={testTakerFieldName} style={{ marginBottom: '24px' }}>
                    <div style={{
                      padding: '16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      backgroundColor: '#fafafa'
                    }}>
                      <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>
                        Người xét nghiệm {index + 1}
                      </h4>

                      {/* Select Test Taker */}
                      <Form.Item
                        name={testTakerFieldName}
                        label={`Chọn người xét nghiệm ${index + 1}`}
                        rules={[
                          {
                            required: true,
                            message: `Vui lòng chọn người ${index + 1}`,
                          },
                        ]}
                      >
                        <Select
                          placeholder={`Chọn người xét nghiệm ${index + 1}`}
                          options={getAvailableTestTakers(testTakerFieldName).map(
                            (taker) => ({
                              value: taker._id,
                              label: taker.name || `Test Taker ${taker._id}`,
                            })
                          )}
                        />
                      </Form.Item>

                      {/* Service Selection Cards */}
                      <Form.Item
                        name={serviceFieldName}
                        label={`Chọn dịch vụ cho người ${index + 1}`}
                        rules={[
                          {
                            required: true,
                            message: `Vui lòng chọn dịch vụ cho người ${index + 1}`,
                          },
                        ]}
                      >
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {isLoadingServices ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '40px 20px',
                              color: '#999',
                              fontSize: '16px'
                            }}>
                              Đang tải dịch vụ...
                            </div>
                          ) : serviceError ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '40px 20px',
                              color: 'gray',
                              fontSize: '16px'
                            }}>
                              {(serviceError as any)?.data?.message}
                            </div>
                          ) : (
                            <Row gutter={[12, 12]}>
                              {serviceList.map((service: Service) => {
                                const isDisabled = isServiceDisabled(service._id, serviceFieldName);
                                return (
                                  <Col xs={24} sm={12} md={8} key={service._id}>
                                    <Card
                                      size="small"
                                      hoverable={!isDisabled}
                                      style={{
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isDisabled ? 0.5 : 1,
                                        border: selectedTestTakers?.[serviceFieldName] === service._id
                                          ? '2px solid #1890ff'
                                          : '1px solid #d9d9d9'
                                      }}
                                      onClick={() => {
                                        if (!isDisabled) {
                                          form.setFieldValue(serviceFieldName, service._id)
                                        }
                                      }}
                                    >
                                      <Card.Meta
                                        title={
                                          <div>
                                            <Typography.Title
                                              level={5}
                                              style={{
                                                marginTop: 0,
                                                marginBottom: 4,
                                                color: isDisabled ? '#999' : 'inherit'
                                              }}
                                              ellipsis={{ tooltip: service.name }}
                                            >
                                              {service.name} {isDisabled && '(Đã chọn)'}
                                            </Typography.Title>
                                            <Typography.Text
                                              type='secondary'
                                              style={{ fontSize: '12px' }}
                                            >
                                              Mẫu: {service.sample?.name || 'N/A'}
                                            </Typography.Text>
                                          </div>
                                        }
                                        description={
                                          <Space direction='vertical' size='small' style={{ width: '100%' }}>
                                            <Tag color={service.isAgnate ? 'blue' : 'purple'}>
                                              {service.isAgnate ? 'Bên nội' : 'Bên ngoại'}
                                            </Tag>
                                            <Statistic
                                              value={
                                                (service.fee || 0) +
                                                (service.timeReturn?.timeReturnFee || 0) +
                                                (service.sample?.fee || 0)
                                              }
                                              precision={0}
                                              valueStyle={{
                                                color: isDisabled ? '#999' : '#1565C0',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                              }}
                                              suffix='₫'
                                            />
                                          </Space>
                                        }
                                      />
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                          )}
                        </div>
                      </Form.Item>
                    </div>
                  </Col>
                )
              })}
              <Form.Item
                name='slot'
                rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
                style={{ placeSelf: 'center' }}
              >
                <BookingComponent
                  onConfirmBooking={handleConfirmBooking} // Hàm xác nhận cuối cùng
                  onSelectSlot={setSelectedSlotId} // ✅ Hàm để chọn slot
                  selectedSlotId={selectedSlotId} // ✅ Giá trị slot đang được chọn
                  addressId={selectedAddressId}
                  setAddressId={setSelectedAddressId}
                  setDisabled={setIsDisabled}
                  setAgreed={setIsAgreed}
                  isAgreed={isAgreed}
                  selectedServices={[
                    serviceList.find((s: Service) => s._id === selectedTestTakers?.service1),
                    serviceList.find((s: Service) => s._id === selectedTestTakers?.service2)
                  ].filter(Boolean)} // Truyền danh sách dịch vụ đã chọn
                />
              </Form.Item>
              <Col span={24}>
                <p style={{ fontStyle: 'italic', color: 'gray' }}>
                  * Các dịch vụ tại nhà chỉ có thể được sử dụng với mục đích dân sự
                </p>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button
                    type='primary'
                    htmlType='submit'
                    block
                    disabled={isDisabled || !isAgreed}
                    loading={isCreating}
                  >
                    Đăng ký
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    </div>
  )
}

export default ServiceAtHomeForm
