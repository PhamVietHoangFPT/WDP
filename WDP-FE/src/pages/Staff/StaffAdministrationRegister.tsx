import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Form,
  Typography,
  Space,
  Button,
  message,
  Table,
  Checkbox,
  Modal,
  DatePicker,
  Radio,
  Flex,
  Tag,
  Statistic,
  Switch,
} from 'antd'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek' // Giữ lại isoWeek nếu bạn muốn tuần ISO (Thứ 2 - CN)
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/vi'
import isBetween from 'dayjs/plugin/isBetween'
// Import các hooks API
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import {
  useGetTestTakersQuery,
  useCreateTestTakerMutation,
} from '../../features/customer/testTakerApi'
import { useCreateCaseMemberMutation } from '../../features/caseMembers/caseMemebers'
import { useCreateServiceCaseMutation } from '../../features/serviceCase/serviceCase'
import { useCreateServiceCasePaymentMutation } from '../../features/vnpay/vnpayApi'
import { useCreateBookingMutation } from '../../features/customer/bookingApi'
import {
  useGetSlotsListQuery,
  useGetSlotTemplateForFacilityQuery,
} from '../../features/admin/slotAPI'

import type { Slot } from '../../types/slot'
dayjs.locale('vi')
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const { Title, Text } = Typography

const generateTimeSlots = (
  workTimeStart: any,
  workTimeEnd: any,
  slotDuration: number
) => {
  const slots = []
  // Sử dụng một ngày giả để thực hiện các phép toán thời gian
  const startDate = new Date(`1970-01-01T${workTimeStart}`)
  const endDate = new Date(`1970-01-01T${workTimeEnd}`)
  const durationInMinutes = slotDuration * 60

  // Hàm tiện ích để định dạng thời gian về dạng "HH:mm"
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  let currentTime = new Date(startDate)

  while (currentTime < endDate) {
    const slotStart = new Date(currentTime)
    const slotEnd = new Date(
      currentTime.getTime() + durationInMinutes * 60 * 1000
    )

    // Dừng lại nếu khung giờ tiếp theo vượt quá giờ làm việc
    if (slotEnd > endDate) {
      break
    }

    const startStr = formatTime(slotStart)
    const endStr = formatTime(slotEnd)

    slots.push({
      label: `${startStr} - ${endStr}`,
      start: startStr,
      end: endStr,
    })

    // Cập nhật thời gian cho vòng lặp tiếp theo
    currentTime = slotEnd
  }

  return slots
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'THỨ HAI', short: 'T2' },
  { key: 'tuesday', label: 'THỨ BA', short: 'T3' },
  { key: 'wednesday', label: 'THỨ TƯ', short: 'T4' },
  { key: 'thursday', label: 'THỨ NĂM', short: 'T5' },
  { key: 'friday', label: 'THỨ SÁU', short: 'T6' },
  { key: 'saturday', label: 'THỨ BẢY', short: 'T7' },
  { key: 'sunday', label: 'CHỦ NHẬT', short: 'CN' },
]

// --- COMPONENT CHÍNH ---
export default function StaffAdministrationRegister() {
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))
  const [form] = Form.useForm()
  const [createTestTakerForm] = Form.useForm()

  // --- STATE QUẢN LÝ LUỒNG LÀM VIỆC ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const testTakerCount = 2
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isAgreed, setIsAgreed] = useState(false)
  const [totalServiceFee, setTotalServiceFee] = useState<number>(0)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])
  const [showAgnate, setShowAgnate] = useState<boolean>(true)
  // --- LẤY THÔNG TIN NHÂN VIÊN TỪ COOKIES ---
  const staffData = useMemo(
    () =>
      Cookies.get('userData')
        ? JSON.parse(Cookies.get('userData') as string)
        : null,
    []
  )
  const staffAccountId = staffData?.id
  const staffFacilityId = staffData?.facility._id
  const staffAddressId = staffData?.facility.address

  const {
    data: serviceListData,
    isLoading: isLoadingServices,
    error: serviceError,
  } = useGetServiceListQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      isAdministration: true,
      isSelfSampling: false,
      isAgnate: showAgnate, // Sử dụng API query theo isAgnate
    },
    {
      refetchOnMountOrArgChange: true, // Refetch khi component mount hoặc argument thay đổi
    }
  )

  // --- LẤY DỮ LIỆU CHO BƯỚC 2 & 3 ---
  const { data: testTakersData, isLoading: testTakersLoading } =
    useGetTestTakersQuery(
      { accountId: staffAccountId, pageSize: 100 },
      { skip: !staffAccountId }
    )
  const { data: slotTemplateData } = useGetSlotTemplateForFacilityQuery(
    staffFacilityId,
    { skip: !staffFacilityId }
  )
  const { data: slotsData, isLoading: slotsLoading } = useGetSlotsListQuery(
    {
      facilityId: staffFacilityId,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD'),
      isAdministration: true,
      isAvailable: true,
    },
    { skip: !staffFacilityId }
  )

  // --- MUTATIONS ---
  const [createTestTaker, { isLoading: isCreatingTestTaker }] =
    useCreateTestTakerMutation()
  const [createBooking] = useCreateBookingMutation()
  const [createCaseMember] = useCreateCaseMemberMutation()
  const [createServiceCase, { isLoading: isSubmitting }] =
    useCreateServiceCaseMutation()
  const [createPaymentUrl] = useCreateServiceCasePaymentMutation()

  const selectedTestTakers = Form.useWatch([], form)

  // Hàm tính tổng phí dịch vụ
  const calculateTotalServiceFee = useCallback(
    (selectedServiceIds: string[]) => {
      if (!selectedServiceIds || selectedServiceIds.length === 0) return 0

      const total = selectedServiceIds.reduce((sum, serviceId) => {
        const service = serviceListData?.data?.find(
          (s: any) => s._id === serviceId
        )
        if (service) {
          return (
            sum +
            (service.fee || 0) +
            (service.timeReturn?.timeReturnFee || 0) +
            (service.sample?.fee || 0)
          )
        }
        return sum
      }, 0)

      return total
    },
    [serviceListData]
  )

  // Cập nhật tổng phí khi services thay đổi
  useEffect(() => {
    const services = selectedTestTakers?.sharedServices || []
    const total = calculateTotalServiceFee(services)
    setTotalServiceFee(total)
  }, [
    selectedTestTakers?.sharedServices,
    serviceListData,
    calculateTotalServiceFee,
  ])

  // Reset form khi thay đổi bên xét nghiệm
  useEffect(() => {
    form.setFieldValue('sharedServices', [])
    setTotalServiceFee(0)
  }, [showAgnate, form])

  const getAvailableTestTakers = (currentField: string) => {
    if (!testTakersData?.data) return []
    const selectedIds = Object.values(selectedTestTakers || {}).filter(
      (id) => id
    )
    return testTakersData.data.filter(
      (taker: { _id: unknown }) =>
        !selectedIds.includes(taker._id) ||
        selectedTestTakers[currentField] === taker._id
    )
  }

  const handleCreateTestTaker = async (values: any) => {
    try {
      await createTestTaker({ ...values, account: staffAccountId }).unwrap()
      message.success('Tạo hồ sơ người xét nghiệm thành công!')
      setIsModalOpen(false)
      createTestTakerForm.resetFields()
    } catch (err) {
      message.error('Tạo hồ sơ thất bại.')
    }
  }

  // HÀM SUBMIT CUỐI CÙNG
  const onFinish = async (values: any) => {
    if (!selectedSlotId) return message.error('Vui lòng chọn một lịch hẹn.')
    if (!isAgreed)
      return message.error('Bạn cần đồng ý với điều khoản để tiếp tục.')
    if (!values.sharedServices || values.sharedServices.length === 0)
      return message.error('Vui lòng chọn ít nhất một dịch vụ.')

    try {
      const testTakers = [values.testTaker1, values.testTaker2].filter(Boolean)

      const bookingRes = await createBooking({
        slot: selectedSlotId,
        account: staffAccountId,
        note: 'Đăng ký dịch vụ hành chính',
      }).unwrap()
      const bookingId = bookingRes._doc?._id || bookingRes?._id

      const caseMemberRes = await createCaseMember({
        data: {
          testTaker: testTakers,
          booking: bookingId,
          service: values.sharedServices, // Sử dụng array của services
          isAtHome: false,
          isSelfSampling: false,
          address: staffAddressId,
          isSingleService: false, // Luôn là false cho dịch vụ hành chính
          note: 'Đăng ký dịch vụ hành chính',
        },
      }).unwrap()
      const caseMemberId = caseMemberRes._id

      const serviceCaseRes = await createServiceCase({
        data: {
          caseMember: caseMemberId,
          shippingFee: 0,
          totalFee: totalServiceFee, // Sử dụng tổng phí đã tính
        },
      }).unwrap()
      const serviceCaseId = serviceCaseRes._id

      const paymentResponse = await createPaymentUrl({ serviceCaseId }).unwrap()
      if (paymentResponse) {
        window.location.href = paymentResponse
      }

      message.success(
        'Đã tạo yêu cầu thành công! Vui lòng hoàn tất thanh toán.'
      )
      form.resetFields()
    } catch (err: any) {
      console.log(err)
      message.error(err.data?.message || 'Đăng ký thất bại.')
    }
  }

  const handleDateSelect = (value: dayjs.Dayjs | null) => {
    if (value) {
      // Khi người dùng chọn 1 ngày, tính toán đầu và cuối tuần của ngày đó
      const startOfWeek = value.startOf('isoWeek')
      const endOfWeek = value.endOf('isoWeek')

      setDateRange([startOfWeek, endOfWeek]) // Cập nhật state dateRange với cả tuần
      setSelectedDisplayDate(value) // Cập nhật ngày hiển thị trong input của DatePicker
    } else {
      // Xử lý khi người dùng xóa lựa chọn (clear)
      setDateRange([dayjs(), dayjs()])
      setSelectedDisplayDate(null)
    }
  }

  // LOGIC RENDER BẢNG CHỌN SLOT (từ BookingPage.tsx)
  const TIME_SLOTS = useMemo(() => {
    // 👇 GUARD CLAUSE: Đây là phần quan trọng nhất để sửa lỗi
    // Chỉ chạy khi slotTemplateData có giá trị và có chứa mảng data
    if (
      !slotTemplateData ||
      !slotTemplateData.data ||
      slotTemplateData.data.length === 0
    ) {
      return [] // Trả về một mảng rỗng nếu dữ liệu chưa sẵn sàng
    }

    // Nếu đã có dữ liệu, lấy template đầu tiên
    const template = slotTemplateData.data[0]

    // Bây giờ việc gọi hàm là an toàn
    return generateTimeSlots(
      template.workTimeStart,
      template.workTimeEnd,
      template.slotDuration
    )
  }, [slotTemplateData])

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    (dateRange[0] || dayjs()).startOf('isoWeek').add(i, 'day')
  )

  const getSlotsForDayAndTime = (dayDate: dayjs.Dayjs, timeSlot: any) => {
    if (!slotsData) return []
    return slotsData.filter((slot: any) => {
      const slotDate = dayjs(slot.slotDate)
      return (
        slotDate.isSame(dayDate, 'day') &&
        slot.startTime >= timeSlot.start &&
        slot.startTime < timeSlot.end
      )
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Đăng ký Dịch vụ Hành chính</Title>
      <Text type='secondary'>
        Nhân viên tạo hồ sơ và đăng ký dịch vụ cho khách hàng.
      </Text>
      (
      <Card style={{ marginTop: 24 }}>
        <div
          style={{
            marginTop: 24,
            borderTop: '1px solid #f0f0f0',
            paddingTop: 24,
          }}
        >
          <Form form={form} layout='vertical' onFinish={onFinish}>
            <Title level={4}>Thông tin đăng ký</Title>

            {/* Phần chọn người xét nghiệm */}
            <Space align='baseline' style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>
                Chọn người xét nghiệm
              </Title>
              <Button type='link' onClick={() => setIsModalOpen(true)}>
                Tạo hồ sơ mới
              </Button>
            </Space>
            <Row gutter={16}>
              {[...Array(testTakerCount)].map((_, index) => {
                const fieldName = `testTaker${index + 1}`
                return (
                  <Col span={24} sm={12} key={fieldName}>
                    <Form.Item
                      name={fieldName}
                      label={`Người ${index + 1}`}
                      rules={[{ required: true, message: 'Vui lòng chọn' }]}
                    >
                      <Select
                        placeholder='Chọn người xét nghiệm'
                        options={getAvailableTestTakers(fieldName).map(
                          (taker: { _id: any; name: any }) => ({
                            value: taker._id,
                            label: taker.name,
                          })
                        )}
                        loading={testTakersLoading}
                      />
                    </Form.Item>
                  </Col>
                )
              })}
            </Row>

            {/* Phần chọn dịch vụ */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '20px',
                }}
              >
                <Text style={{ marginTop: '0', marginRight: '8px' }}>
                  Chọn bên xét nghiệm:
                </Text>
                <Switch
                  checked={showAgnate}
                  onChange={(checked) => setShowAgnate(checked)}
                  checkedChildren='Bên nội'
                  unCheckedChildren='Bên ngoại'
                />
              </div>

              <div
                style={{
                  padding: '16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: '#fff3cd',
                }}
              >
                <Title
                  level={5}
                  style={{ marginBottom: '16px', color: '#856404' }}
                >
                  Dịch vụ chung cho tất cả người xét nghiệm
                </Title>

                <Form.Item
                  name='sharedServices'
                  label='Chọn các dịch vụ (có thể chọn nhiều)'
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn ít nhất một dịch vụ',
                    },
                  ]}
                >
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {isLoadingServices ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          color: '#999',
                          fontSize: '16px',
                        }}
                      >
                        Đang tải dịch vụ...
                      </div>
                    ) : serviceError ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          color: 'gray',
                          fontSize: '16px',
                        }}
                      >
                        {(serviceError as any)?.data?.message}
                      </div>
                    ) : (
                      <Row gutter={[12, 12]}>
                        {(serviceListData?.data || []).map((service: any) => {
                          const isSelected =
                            selectedTestTakers?.sharedServices?.includes(
                              service._id
                            )
                          return (
                            <Col xs={24} sm={12} md={8} key={service._id}>
                              <Card
                                size='small'
                                hoverable
                                style={{
                                  cursor: 'pointer',
                                  border: isSelected
                                    ? '2px solid #1890ff'
                                    : '1px solid #d9d9d9',
                                }}
                                onClick={() => {
                                  const currentServices =
                                    selectedTestTakers?.sharedServices || []
                                  let newServices
                                  if (currentServices.includes(service._id)) {
                                    // Bỏ chọn service
                                    newServices = currentServices.filter(
                                      (id: string) => id !== service._id
                                    )
                                  } else {
                                    // Thêm service
                                    newServices = [
                                      ...currentServices,
                                      service._id,
                                    ]
                                  }
                                  form.setFieldValue(
                                    'sharedServices',
                                    newServices
                                  )
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
                                        }}
                                        ellipsis={{ tooltip: service.name }}
                                      >
                                        {service.name}
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
                                    <Space
                                      direction='vertical'
                                      size='small'
                                      style={{ width: '100%' }}
                                    >
                                      <Tag
                                        color={
                                          service.isAgnate ? 'blue' : 'purple'
                                        }
                                      >
                                        {service.isAgnate
                                          ? 'Bên nội'
                                          : 'Bên ngoại'}
                                      </Tag>
                                      <Statistic
                                        value={
                                          (service.fee || 0) +
                                          (service.timeReturn?.timeReturnFee ||
                                            0) +
                                          (service.sample?.fee || 0)
                                        }
                                        precision={0}
                                        valueStyle={{
                                          color: '#1565C0',
                                          fontSize: '14px',
                                          fontWeight: 'bold',
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
            </div>

            {/* Phần chọn lịch hẹn */}
            <Title level={5} style={{ marginTop: 24 }}>
              Chọn lịch hẹn tại cơ sở
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type='secondary' style={{ marginBottom: 4 }}>
                Chọn tuần
              </Text>
              <DatePicker
                picker='date'
                value={selectedDisplayDate}
                onChange={handleDateSelect}
                style={{ width: '100%' }}
                cellRender={(currentDate, info) => {
                  if (info.type !== 'date') return info.originNode

                  const style: React.CSSProperties = {}
                  const start = dateRange[0]
                  const end = dateRange[1]

                  const current = dayjs(currentDate)

                  if (
                    start &&
                    end &&
                    current.isBetween(start, end, 'day', '[]')
                  ) {
                    style.border = '1px solid #1677ff'
                    style.borderRadius = '4px'
                  }

                  if (current.isSame(selectedDisplayDate, 'day')) {
                    style.background = '#262626'
                  }

                  return (
                    <div className='ant-picker-cell-inner' style={style}>
                      {current.date()}
                    </div>
                  )
                }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table
                bordered
                pagination={false}
                dataSource={TIME_SLOTS}
                loading={slotsLoading}
                rowKey='label'
                scroll={{ x: 'max-content' }} // Đảm bảo bảng có thể cuộn ngang trên màn hình nhỏ
                components={{
                  body: {
                    cell: (props: any) => (
                      <td {...props} style={{ minHeight: 70, padding: 8 }} />
                    ),
                  },
                }}
              >
                <Table.Column
                  title='Thời gian'
                  dataIndex='label'
                  key='time'
                  width={120}
                  fixed='left'
                  align='center'
                  render={(label) => <Text strong>{label}</Text>}
                />

                {weekDates.map((date, idx) => (
                  <Table.Column
                    key={idx}
                    align='center'
                    title={
                      <>
                        <Text>{DAYS_OF_WEEK[idx].short}</Text>
                        <br />
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          {date.format('DD/MM')}
                        </Text>
                      </>
                    }
                    render={(_text, timeSlot: (typeof TIME_SLOTS)[0]) => {
                      const slots = getSlotsForDayAndTime(date, timeSlot)

                      if (slots.length === 0) {
                        return null // Ant Design sẽ tự động hiển thị ô trống
                      }

                      return (
                        <Flex vertical gap='small' justify='center'>
                          {slots.map((slot: Slot) => {
                            const isSelected = selectedSlotId === slot._id
                            return (
                              <Button
                                key={slot._id}
                                type={isSelected ? 'primary' : 'default'}
                                block
                                onClick={() => {
                                  setSelectedSlotId(slot._id)
                                }}
                                style={{
                                  height: 'auto',
                                  padding: '4px 8px',
                                }}
                              >
                                <Text
                                  style={{
                                    color: isSelected ? '#fff' : 'inherit',
                                  }}
                                >
                                  {slot.startTime} - {slot.endTime}
                                </Text>
                              </Button>
                            )
                          })}
                        </Flex>
                      )
                    }}
                  />
                ))}
              </Table>
            </div>

            {/* Hiển thị tổng phí dịch vụ */}
            {totalServiceFee > 0 && (
              <Card
                style={{
                  marginTop: 24,
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                }}
              >
                <Row justify='space-between' align='middle'>
                  <Col>
                    <Typography.Text strong style={{ fontSize: '16px' }}>
                      Tổng phí dịch vụ:
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Typography.Text
                      strong
                      style={{
                        fontSize: '18px',
                        color: '#52c41a',
                        fontWeight: 'bold',
                      }}
                    >
                      {totalServiceFee.toLocaleString()} ₫
                    </Typography.Text>
                  </Col>
                </Row>
                <Typography.Text type='secondary' style={{ fontSize: '12px' }}>
                  * Phí đã bao gồm: phí dịch vụ + phí mẫu + phí thời gian trả
                  kết quả
                </Typography.Text>
              </Card>
            )}

            <div style={{ marginTop: 24 }}>
              <Checkbox
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              >
                Xác nhận thông tin và các điều khoản liên quan.
              </Checkbox>
            </div>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type='primary'
                htmlType='submit'
                block
                loading={isSubmitting}
                disabled={!isAgreed || !selectedSlotId || totalServiceFee === 0}
              >
                Tạo hồ sơ và Lấy link thanh toán
                {totalServiceFee > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    ({totalServiceFee.toLocaleString()} ₫)
                  </span>
                )}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
      ){/* Modal tạo Test Taker mới */}
      <Modal
        title='Tạo hồ sơ người xét nghiệm mới'
        open={isModalOpen}
        onOk={() => createTestTakerForm.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreatingTestTaker}
      >
        <Form
          form={createTestTakerForm}
          layout='vertical'
          onFinish={handleCreateTestTaker}
        >
          <Form.Item name='name' label='Họ và tên' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name='personalId'
            label='CCCD/Mã định danh'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='gender'
            label='Giới tính'
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={true}>Nam</Radio>
              <Radio value={false}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name='dateOfBirth'
            label='Ngày sinh'
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
