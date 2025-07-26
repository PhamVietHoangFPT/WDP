import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DatePicker,
  Select,
  Typography,
  Switch,
  Empty,
  Spin,
  ConfigProvider,
  Card,
  Button,
  message,
  Flex,
  Tag,
  Col,
  Row,
  Table,
  Divider,
  Statistic,
  List,
  Space,
  Checkbox,
} from 'antd'
import dayjs from 'dayjs'
import viVN from 'antd/locale/vi_VN'
import isoWeek from 'dayjs/plugin/isoWeek' // Giữ lại isoWeek nếu bạn muốn tuần ISO (Thứ 2 - CN)
import weekOfYear from 'dayjs/plugin/weekOfYear' // Thêm plugin này để đảm bảo 'startOf('week')' hoạt động tốt
import isBetween from 'dayjs/plugin/isBetween'
import { useGetFacilitiesNameAndAddressQuery } from '../../features/admin/facilitiesAPI'
import { useGetSlotsListQuery } from '../../features/admin/slotAPI'
import { useGetSlotTemplateForFacilityQuery } from '../../features/admin/slotAPI'
import type { Slot } from '../../types/slot'
import { CalculatorOutlined, CheckOutlined } from '@ant-design/icons'
import { useGetAddressesQuery } from '../../features/address/addressAPI'
import { useGetSamplingKitInventoryBySampleIdAndFacilityIdQuery } from '../../features/samplingKitInventory/samplingKitInventoryAPI'
import type { CheckboxChangeEvent } from 'antd/lib'
dayjs.locale('vi')
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const { Title, Text, Paragraph } = Typography
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

interface BookingComponentProps {
  onConfirmBooking: (details: {
    slotId: string
    shippingFee: number
    addressId: string | null
  }) => void
  onSelectSlot: (slotId: string | null) => void
  selectedSlotId: string | null
  serviceDetail: {
    name: string
    fee: number
    timeReturn: {
      timeReturnFee: number
    }
    sample: {
      _id: string
      fee: number
    }
  }
  addressId: string | null
  setAddressId: (addressId: string | null) => void
  setDisabled: (disabled: boolean) => void
  setAgreed: (agreed: boolean) => void
  isAgreed: boolean
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

const BookingComponent: React.FC<BookingComponentProps> = ({
  onConfirmBooking,
  onSelectSlot,
  selectedSlotId,
  serviceDetail,
  addressId,
  setAddressId,
  setDisabled,
  setAgreed,
  isAgreed,
}) => {
  const { data: addressesData, isLoading: addressesLoading } =
    useGetAddressesQuery({})
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const {
    data: samplingKitData,
    isError: samplingKitIsError,
    error: samplingKitError,
  } = useGetSamplingKitInventoryBySampleIdAndFacilityIdQuery(
    { sampleId: serviceDetail?.sample?._id, facilityId },
    {
      skip: !facilityId,
    }
  )

  useEffect(() => {
    if (samplingKitIsError) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [samplingKitIsError, setDisabled])
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const isProcessingRef = useRef(false)

  // State cho việc tính toán và hiển thị
  const [shippingFee, setShippingFee] = useState<number | null>(0)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])
  // Giá trị cho DatePicker (chỉ cần 1 ngày để hiển thị trong input)
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))
  const {
    data: facilitiesData,
    isLoading: facilitiesLoading,
    isError: facilitiesError,
  } = useGetFacilitiesNameAndAddressQuery({})
  const { data: slotTemplateData } = useGetSlotTemplateForFacilityQuery(
    facilityId,
    {
      skip: !facilityId,
    }
  )

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

  const {
    data: slotsData,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useGetSlotsListQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      facilityId,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD'),
      isAvailable,
    },
    { skip: !facilityId }
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

  // Tạo mảng các ngày trong tuần DỰA TRÊN dateRange
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    (dateRange[0] || dayjs()).startOf('isoWeek').add(i, 'day')
  )

  // --- Hàm xử lý khi người dùng chọn một ngày từ DatePicker ---
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

  const handleAgreementChange = (e: CheckboxChangeEvent) => {
    console.log(e.target.checked)
    setAgreed(e.target.checked)
    handleConfirmBooking()
  }

  const handleCalculateShipping = useCallback(async () => {
    if (isProcessingRef.current) return
    if (!facilityId) {
      message.error('Vui lòng chọn một cơ sở.')
      return
    }
    if (!addressId) {
      message.error('Vui lòng chọn địa chỉ của bạn.')
      return
    }
    if (!serviceDetail) {
      message.error('Chưa có thông tin dịch vụ.')
      return
    }

    isProcessingRef.current = true
    setIsCalculatingFee(true)
    message.loading({ content: 'Đang tính toán chi phí...', key: 'shipping' })

    try {
      // Lấy tọa độ của người dùng từ địa chỉ đã chọn
      const userAddress = addressesData?.data?.find(
        (addr) => addr._id === addressId
      )
      if (!userAddress?.location?.coordinates) {
        throw new Error('Địa chỉ đã chọn không có thông tin tọa độ.')
      }
      const [userLon, userLat] = userAddress.location.coordinates

      // Lấy tọa độ của cơ sở
      const facilityRawData = facilitiesData?.data?.find(
        (f) => f._id === facilityId
      )
      if (!facilityRawData?.address?.location?.coordinates) {
        throw new Error('Cơ sở này không có thông tin tọa độ.')
      }
      const [facilityLon, facilityLat] =
        facilityRawData.address.location.coordinates

      // Tính toán phí
      const serviceFee =
        (serviceDetail?.fee || 0) +
        (serviceDetail?.timeReturn?.timeReturnFee || 0) +
        (serviceDetail?.sample?.fee || 0)
      const distance = getDistanceFromLatLonInKm(
        userLat,
        userLon,
        facilityLat,
        facilityLon
      )

      let calculatedShippingFee = distance > 5 ? (distance - 5) * 10000 : 0
      calculatedShippingFee = Math.ceil(calculatedShippingFee / 1000) * 1000
      const calculatedTotalPrice = serviceFee + calculatedShippingFee

      setShippingFee(calculatedShippingFee)
      setTotalPrice(calculatedTotalPrice)

      message.success({ content: 'Đã tính xong!', key: 'shipping' })
    } catch (error) {
      console.error('Lỗi khi tính phí dịch vụ:', error)
      message.error({
        content: error instanceof Error ? error.message : String(error),
        key: 'shipping',
        duration: 3,
      })
      setShippingFee(null)
      setTotalPrice(null)
    } finally {
      isProcessingRef.current = false
      setIsCalculatingFee(false)
    }
  }, [facilityId, addressId, serviceDetail, facilitiesData, addressesData])

  const selectOptions = useMemo(() => {
    if (!facilitiesData?.data?.length) return []

    // Tìm đối tượng địa chỉ đầy đủ mà người dùng đã chọn
    const selectedUserAddress = addressesData?.data?.find(
      (addr) => addr._id === addressId
    )

    const mappedFacilities = facilitiesData.data.map((facility) => {
      const fullAddress = facility.address?.fullAddress || 'N/A'
      const facilityLocation = facility.address?.location
      let distance

      // Chỉ tính khoảng cách khi người dùng đã chọn địa chỉ VÀ cả hai đều có tọa độ
      if (
        selectedUserAddress?.location?.coordinates &&
        facilityLocation?.coordinates
      ) {
        const [userLon, userLat] = selectedUserAddress.location.coordinates
        const [facilityLon, facilityLat] = facilityLocation.coordinates
        distance = getDistanceFromLatLonInKm(
          userLat,
          userLon,
          facilityLat,
          facilityLon
        )
      }

      return {
        value: facility._id,
        label: facility.facilityName,
        address: fullAddress,
        searchLabel: `${facility.facilityName} ${fullAddress}`,
        distance,
      }
    })

    // Sắp xếp lại nếu đã có địa chỉ được chọn
    if (selectedUserAddress) {
      mappedFacilities.sort((a, b) => {
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
    }

    return mappedFacilities
  }, [facilitiesData, addressesData, addressId]) // `useMemo` giờ phụ thuộc vào cả `userLocation`

  // === 7. TỰ ĐỘNG CHỌN CƠ SỞ GẦN NHẤT SAU KHI TÌM THẤY VỊ TRÍ ===
  useEffect(() => {
    // Chỉ chạy khi đã chọn địa chỉ VÀ danh sách cơ sở đã được tính toán/sắp xếp
    if (addressId && selectOptions.length > 0) {
      const nearestFacility = selectOptions.find(
        (opt) => opt.distance !== undefined
      )
      if (nearestFacility) {
        setFacilityId(nearestFacility.value)
        setAgreed(false)
      }
    }
  }, [addressId, selectOptions, setAgreed])

  useEffect(() => {
    setShippingFee(0)
    setTotalPrice(null)
    onSelectSlot(null)
    setAgreed(false)
  }, [addressId, facilityId, onSelectSlot, setAgreed])

  const handleConfirmBooking = () => {
    // 1. Kiểm tra đã chọn địa chỉ chưa
    if (!addressId) {
      message.error('Vui lòng chọn địa chỉ của bạn.')
      return // Dừng hàm
    }

    // 2. Kiểm tra đã chọn khung giờ chưa
    if (!selectedSlotId) {
      message.error('Vui lòng chọn một khung giờ hẹn trên lịch.')
      return // Dừng hàm
    }

    // 3. Kiểm tra đã tính phí dịch vụ chưa (sửa lỗi shippingFee = 0)
    if (shippingFee === null) {
      message.error('Bạn cần bấm "Tính phí dịch vụ" trước khi xác nhận.')
      return // Dừng hàm
    }

    // ✅ Nếu tất cả điều kiện đều đạt, tiến hành xác nhận
    onConfirmBooking({
      slotId: selectedSlotId,
      shippingFee: shippingFee, // Giờ sẽ hoạt động đúng kể cả khi phí là 0
      addressId: addressId,
    })

    if (!isAgreed) {
      message.success('Đã xác nhận thông tin đặt lịch!')
    } else {
      message.warning('Bạn cần đồng ý với các điều khoản trước khi xác nhận.')
    }
  }

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ width: 'fit-content', padding: 16 }}>
        <Title level={4}>Chọn lịch hẹn</Title>
        <Card style={{ marginBottom: 24, minWidth: 800 }}>
          <Row gutter={[16, 16]} align='bottom'>
            <Col xs={24}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text type='secondary' style={{ marginBottom: 4 }}>
                  Chọn địa chỉ của bạn
                </Text>
                <Select
                  placeholder='Chọn một địa chỉ đã lưu...'
                  style={{ width: '100%' }}
                  loading={addressesLoading}
                  value={addressId}
                  onChange={(id) => setAddressId(id)} // Cập nhật state từ props
                  options={addressesData?.data?.map((addr) => ({
                    value: addr._id,
                    label: addr.fullAddress,
                  }))}
                  notFoundContent={
                    addressesLoading ? (
                      <Spin size='small' />
                    ) : (
                      <Empty description='Không có địa chỉ' />
                    )
                  }
                />
              </div>
            </Col>
            <Col xs={24} md={18}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text type='secondary' style={{ marginBottom: 4 }}>
                  Cơ sở
                </Text>
                <Select
                  placeholder='Chọn hoặc tìm kiếm cơ sở'
                  style={{ width: '100%' }}
                  loading={facilitiesLoading}
                  onChange={(val) => {
                    setFacilityId(val)
                  }}
                  value={facilityId}
                  allowClear
                  showSearch
                  options={selectOptions}
                  filterOption={(input, option) =>
                    (option?.searchLabel ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  optionRender={(option) => (
                    <div>
                      <Flex align='center' justify='space-between'>
                        <Text strong>{option.data.label}</Text>
                        {option.data.distance !== undefined && (
                          <Tag color='green'>
                            ~ {option.data.distance.toFixed(1)} km
                          </Tag>
                        )}
                      </Flex>
                      <Text type='secondary' style={{ fontSize: '0.85em' }}>
                        {option.data.address}
                      </Text>
                    </div>
                  )}
                  notFoundContent={
                    facilitiesLoading || facilitiesError ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '8px',
                        }}
                      >
                        <Spin size='small' />
                      </div>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description='Không có dữ liệu'
                      />
                    )
                  }
                />
                {samplingKitError ? (
                  <Text type='danger' style={{ marginTop: 8 }}>
                    {'data' in samplingKitError &&
                    samplingKitError.data?.message
                      ? samplingKitError.data.message
                      : 'Lỗi không xác định. Vui lòng thử lại.'}
                  </Text>
                ) : (
                  samplingKitData && (
                    <Text type='secondary' style={{ marginTop: 8 }}>
                      Số lượng bộ kit hiện có:{' '}
                      {samplingKitData?.data[0]?.inventory || 0}
                    </Text>
                  )
                )}
              </div>
            </Col>
          </Row>
          {/* Hàng 2: Lọc theo ngày và trạng thái */}
          <Row gutter={[16, 16]} align='middle' style={{ marginTop: 16 }}>
            <Col xs={24} sm={16} md={12}>
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
            </Col>
            <Col xs={24} sm={8} md={12}>
              <Flex
                justify='end'
                align='center'
                style={{ height: '100%', minHeight: '32px' }}
              >
                <Text style={{ marginRight: 8 }}>Chỉ hiện slot trống</Text>
                <Switch checked={isAvailable} onChange={setIsAvailable} />
              </Flex>
            </Col>
          </Row>
        </Card>

        {!facilityId ? (
          <Empty description='Chọn cơ sở để xem lịch' />
        ) : slotsLoading ? (
          <Spin />
        ) : slotsError ? (
          <div>
            <Empty description='Cơ sở này không còn lịch trống' />
          </div>
        ) : (
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
                                // ✅ SỬA LỖI TẠI ĐÂY:
                                // Gọi hàm onSelectSlot mà component cha đã truyền xuống
                                onSelectSlot(slot._id)

                                // Đồng thời reset các giá trị phí để bắt người dùng tính lại
                                setShippingFee(null)
                                setTotalPrice(null)
                              }}
                              style={{ height: 'auto', padding: '4px 8px' }}
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
        )}
        {selectedSlotId && (
          <Card style={{ marginTop: 24 }}>
            <Title level={5}>Tổng hợp chi phí (Ước tính)</Title>
            <Flex justify='space-between' align='center'>
              <Text>Dịch vụ:</Text>
              <Text strong>{serviceDetail.name}</Text>
            </Flex>
            <Space direction='vertical' style={{ width: '100%' }}>
              <List
                size='small'
                dataSource={[
                  {
                    label: 'Chi phí cho mẫu và trả mẫu',
                    value:
                      serviceDetail.fee +
                      serviceDetail.timeReturn.timeReturnFee +
                      serviceDetail.sample.fee,
                    isFee: true,
                  },
                  {
                    label: 'Phí dịch vụ',
                    value: shippingFee,
                    isFee: true,
                    color: '#52c41a',
                  },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0', border: 'none' }}>
                    <List.Item.Meta
                      title={<Text type='secondary'>{item.label}</Text>}
                    />
                    {item.value !== null ? (
                      <Text strong style={{ color: item.color }}>
                        {item.value === 0
                          ? 'Miễn phí'
                          : `${item.value.toLocaleString('vi-VN')} ₫`}
                      </Text>
                    ) : (
                      <Text type='secondary'>_</Text>
                    )}
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '0' }} />
              <Statistic
                title={
                  <Title level={5} style={{ color: 'inherit' }}>
                    Tổng cộng
                  </Title>
                }
                value={totalPrice !== null ? totalPrice : undefined}
                precision={0}
                suffix='₫'
                loading={totalPrice === null}
                valueStyle={{ color: '#1677ff', fontSize: '24px' }}
                style={{ textAlign: 'right', marginTop: '8px' }}
              />
            </Space>
            {shippingFee === null ? (
              <>
                <Button
                  type='primary'
                  icon={<CalculatorOutlined />}
                  loading={isCalculatingFee}
                  onClick={handleCalculateShipping}
                  style={{ width: '100%', marginTop: 24 }}
                  disabled={!facilityId || !addressId} // SỬA LẠI ĐIỀU KIỆN
                >
                  Tính phí dịch vụ
                </Button>
                <Paragraph
                  type='secondary'
                  style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }}
                >
                  Bạn cần thực hiện bước này để ước tính tổng chi phí.
                </Paragraph>
              </>
            ) : (
              <>
                <Checkbox checked={isAgreed} onChange={handleAgreementChange}>
                  Tôi đã đọc và đồng ý với các điều khoản đặt lịch
                </Checkbox>
              </>
            )}
          </Card>
        )}
      </div>
    </ConfigProvider>
  )
}

export default BookingComponent
