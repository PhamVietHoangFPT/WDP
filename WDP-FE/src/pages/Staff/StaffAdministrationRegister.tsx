import React, { useState, useMemo, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Spin,
  Input,
  Select,
  Form,
  Pagination,
  Result,
  Typography,
  Space,
  Statistic,
  Button,
  Descriptions,
  message,
  Table,
  ConfigProvider,
  Checkbox,
  Modal,
  DatePicker,
  Radio,
  Flex,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import viVN from 'antd/locale/vi_VN'
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

// Import các types
import type { Service } from '../../types/service'
import useDebounce from '../../hooks/useDebounce'
dayjs.locale('vi')
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const { Title, Text } = Typography

const generateTimeSlots = (workTimeStart, workTimeEnd, slotDuration) => {
  const slots = []
  // Sử dụng một ngày giả để thực hiện các phép toán thời gian
  const startDate = new Date(`1970-01-01T${workTimeStart}`)
  const endDate = new Date(`1970-01-01T${workTimeEnd}`)
  const durationInMinutes = slotDuration * 60

  // Hàm tiện ích để định dạng thời gian về dạng "HH:mm"
  const formatTime = (date) => {
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
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))
  const [form] = Form.useForm()
  const [createTestTakerForm] = Form.useForm()

  // --- STATE QUẢN LÝ LUỒNG LÀM VIỆC ---
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [testTakerCount, setTestTakerCount] = useState(2)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isAgreed, setIsAgreed] = useState(false)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])

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

  // --- LỌC VÀ TÌM KIẾM DỊCH VỤ (BƯỚC 1) ---
  const [localSearchTerm, setLocalSearchTerm] = useState(
    searchParams.get('name') || ''
  )
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500)
  const serviceQueryParams = useMemo(
    () => ({
      name: debouncedSearchTerm || undefined,
      pageNumber: Number(searchParams.get('pageNumber')) || 1,
      pageSize: 12,
      isAdministration: true,
    }),
    [searchParams, debouncedSearchTerm]
  )
  const {
    data: serviceData,
    isLoading: serviceLoading,
    isError: serviceError,
    error: serviceErrorInfo,
  } = useGetServiceListQuery(serviceQueryParams)

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

  const dataService = serviceData?.data || []
  const totalItems = serviceData?.pagination?.totalItems || 0

  // --- CÁC HÀM XỬ LÝ ---
  const handlePageChange = (page: number, pageSize: number) => {
    /* ... */
  }
  const addTestTaker = () => {
    if (testTakerCount < 3) setTestTakerCount(testTakerCount + 1)
  }
  const removeTestTaker = () => {
    if (testTakerCount === 3) {
      setTestTakerCount(2)
      form.setFieldsValue({ testTaker3: undefined })
    }
  }
  const selectedTestTakers = Form.useWatch([], form)
  const getAvailableTestTakers = (currentField: string) => {
    if (!testTakersData?.data) return []
    const selectedIds = Object.values(selectedTestTakers || {}).filter(
      (id) => id
    )
    return testTakersData.data.filter(
      (taker) =>
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

    try {
      const testTakers = [
        values.testTaker1,
        values.testTaker2,
        values.testTaker3,
      ].filter(Boolean)

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
          service: selectedService?._id,
          isAtHome: false,
          isSelfSampling: false,
          address: staffAddressId,
          note: 'Đăng ký dịch vụ hành chính',
        },
      }).unwrap()
      const caseMemberId = caseMemberRes._id

      const serviceCaseRes = await createServiceCase({
        data: {
          caseMember: caseMemberId,
          shippingFee: 0,
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
      setSelectedService(null)
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
      setDateRange([null, null])
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

  // --- RENDER ---
  const renderServiceList = () => {
    if (serviceLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <Spin size='large' />
        </div>
      )
    }
    if (serviceError) {
      return (
        <Result
          status='error'
          title='Lỗi khi tải dữ liệu'
          subTitle={serviceErrorInfo?.data?.message || 'Vui lòng thử lại.'}
        />
      )
    }
    if (dataService.length === 0) {
      return (
        <Result
          status='404'
          title='Không tìm thấy dịch vụ'
          subTitle='Không có dịch vụ hành chính nào phù hợp.'
        />
      )
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          {dataService.map((service) => (
            <Col key={service._id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                className='service-card'
                onClick={() => setSelectedService(service)}
              >
                <Card.Meta
                  title={
                    <Title level={5} ellipsis={{ tooltip: service.name }}>
                      {service.name}
                    </Title>
                  }
                  description={`Mẫu: ${service.sample.name}`}
                />
                <Statistic
                  title='Chi phí tham khảo'
                  value={(service.fee || 0) + (service.sample?.fee || 0)}
                  precision={0}
                  valueStyle={{
                    color: '#1565C0',
                    fontSize: '1.3rem',
                    marginTop: 12,
                  }}
                  suffix='₫'
                />
              </Card>
            </Col>
          ))}
        </Row>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '24px',
          }}
        >
          <Pagination
            current={serviceQueryParams.pageNumber}
            pageSize={serviceQueryParams.pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger
          />
        </div>
      </>
    )
  }

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ padding: 24 }}>
        <Title level={2}>Đăng ký Dịch vụ Hành chính</Title>
        <Text type='secondary'>
          Nhân viên tạo hồ sơ và đăng ký dịch vụ cho khách hàng.
        </Text>

        {!selectedService ? (
          // Giao diện chọn dịch vụ
          <div style={{ marginTop: 24 }}>
            <Card style={{ marginBottom: 24 }}>
              <Input
                placeholder='Tìm kiếm dịch vụ hành chính...'
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </Card>
            {renderServiceList()}
          </div>
        ) : (
          // Giao diện đăng ký
          <Card style={{ marginTop: 24 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setSelectedService(null)}
              style={{ marginBottom: 16 }}
            >
              Quay lại chọn dịch vụ
            </Button>
            <Descriptions title='Dịch vụ đã chọn' bordered column={1}>
              <Descriptions.Item label='Tên dịch vụ'>
                {selectedService.name}
              </Descriptions.Item>
              <Descriptions.Item label='Chi phí'>
                {(
                  (selectedService.fee || 0) +
                  (selectedService.sample?.fee || 0)
                ).toLocaleString('vi-VN')}{' '}
                ₫
              </Descriptions.Item>
            </Descriptions>

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
                              (taker) => ({
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
                  <Col span={24}>
                    <Space>
                      {testTakerCount < 3 && (
                        <Button type='dashed' onClick={addTestTaker}>
                          Thêm người
                        </Button>
                      )}
                      {testTakerCount === 3 && (
                        <Button type='dashed' danger onClick={removeTestTaker}>
                          Bớt người
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>

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
                        cell: (props) => (
                          <td
                            {...props}
                            style={{ minHeight: 70, padding: 8 }}
                          />
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
                        render={(text, timeSlot: (typeof TIME_SLOTS)[0]) => {
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
                    disabled={!isAgreed || !selectedSlotId}
                  >
                    Tạo hồ sơ và Lấy link thanh toán
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        )}

        {/* Modal tạo Test Taker mới */}
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
            <Form.Item
              name='name'
              label='Họ và tên'
              rules={[{ required: true }]}
            >
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
    </ConfigProvider>
  )
}
