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
import { AimOutlined, CalculatorOutlined } from '@ant-design/icons'
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
  onConfirmBooking: (details: { slotId: string; shippingFee: number }) => void
  onSelectSlot: (slotId: string | null) => void
  selectedSlotId: string | null
  serviceDetail: {
    name: string
    fee: number
    timeReturn: {
      timeReturnFee: number
    }
    sample: {
      fee: number
    }
  }
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

const getLocationPromise = (
  callId: number
): Promise<{ lat: number; lon: number }> => {
  return new Promise(async (resolve, reject) => {
    if (!navigator.permissions || !navigator.geolocation) {
      return reject(
        new Error(
          'Trình duyệt của bạn không hỗ trợ định vị hoặc Permissions API.'
        )
      )
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'geolocation',
      })
      if (permissionStatus.state === 'denied') {
        return reject(
          new Error(
            'Bạn đã từ chối quyền truy cập vị trí. Vui lòng kiểm tra cài đặt của trình duyệt.'
          )
        )
      }

      navigator.geolocation.getCurrentPosition(
        // Success Callback
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        }
        // ✅ THÊM ERROR CALLBACK VÀO ĐÂY
      )
    } catch (error) {
      reject(new Error('Không thể kiểm tra quyền truy cập vị trí.'))
    }
  })
}

const BookingComponent: React.FC<BookingComponentProps> = ({
  onConfirmBooking,
  onSelectSlot,
  selectedSlotId,
  serviceDetail,
}) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lon: number
  } | null>(null)
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)

  // Hợp nhất các state loading
  const [isFindingLocation, setIsFindingLocation] = useState(false)
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const isProcessingRef = useRef(false)

  // State cho việc tính toán và hiển thị
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)
  const [userLocationForSorting, setUserLocationForSorting] = useState<{
    lat: number
    lon: number
  } | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])
  // Giá trị cho DatePicker (chỉ cần 1 ngày để hiển thị trong input)
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))
  const { data: facilitiesData, isLoading: facilitiesLoading } =
    useGetFacilitiesNameAndAddressQuery({})
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

  const { data: slotsData, isLoading: slotsLoading } = useGetSlotsListQuery(
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

  const handleCalculateShipping = useCallback(async () => {
    // Dùng ref để kiểm tra, an toàn hơn
    if (isProcessingRef.current) {
      return
    }
    // Các guard-clause kiểm tra điều kiện
    if (!facilityId) {
      message.error('Vui lòng chọn một cơ sở trước.')
      return
    }
    if (!serviceDetail) {
      message.error('Chưa có thông tin dịch vụ để tính phí.')
      return
    }

    // Bắt đầu quá trình
    isProcessingRef.current = true
    setIsCalculatingFee(true) // Chỉ state này dùng để cập nhật UI (spinner)

    try {
      let locationToUse = userLocation

      // Nếu chưa có vị trí, lấy mới
      if (!locationToUse) {
        message.loading({
          content: 'Đang yêu cầu vị trí của bạn...',
          key: 'shipping',
        })
        const newLocation = await getLocationPromise(Date.now())
        locationToUse = newLocation
        setUserLocation(newLocation) // Cập nhật vào state chung
      }

      if (!locationToUse) {
        throw new Error('Không thể xác định vị trí để tiếp tục tính toán.')
      }

      message.loading({ content: 'Đang tính toán chi phí...', key: 'shipping' })

      // Lấy dữ liệu cơ sở
      const facilityRawData = facilitiesData?.data?.find(
        (f) => f._id === facilityId
      )
      const coordinates = facilityRawData?.address?.location?.coordinates
      if (!coordinates) {
        throw new Error('Cơ sở này không có thông tin tọa độ.')
      }
      const [facilityLon, facilityLat] = coordinates

      // Tính toán
      const serviceFee =
        (serviceDetail?.fee || 0) +
        (serviceDetail?.timeReturn?.timeReturnFee || 0) +
        (serviceDetail?.sample?.fee || 0)
      const distance = getDistanceFromLatLonInKm(
        locationToUse.lat,
        locationToUse.lon,
        facilityLat,
        facilityLon
      )

      let calculatedShippingFee = 0
      if (distance > 5) {
        calculatedShippingFee = (distance - 5) * 10000
      }
      calculatedShippingFee = Math.ceil(calculatedShippingFee / 1000) * 1000
      const calculatedTotalPrice = serviceFee + calculatedShippingFee

      // Cập nhật state kết quả
      setShippingFee(calculatedShippingFee)
      setTotalPrice(calculatedTotalPrice)

      message.success({ content: 'Đã tính xong!', key: 'shipping' })
    } catch (error) {
      console.error('ĐÃ XẢY RA LỖI TRONG KHỐI TRY:', error)
      message.error({
        content: error instanceof Error ? error.message : String(error),
        key: 'shipping',
        duration: 3,
      })
      setShippingFee(null)
      setTotalPrice(null)
    } finally {
      // Kết thúc quá trình
      isProcessingRef.current = false
      setIsCalculatingFee(false)
    }
  }, [facilityId, serviceDetail, userLocation, facilitiesData])

  const handleFindNearest = async () => {
    if (isProcessingRef.current) return

    setIsFindingLocation(true)
    isProcessingRef.current = true
    onSelectSlot(null)

    try {
      const location = await getLocationPromise(Date.now())
      setUserLocation(location)
      setUserLocationForSorting(location)
      message.success('Đã tìm thấy vị trí và sắp xếp lại các cơ sở!')
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsFindingLocation(false)
      isProcessingRef.current = false
    }
  }

  const selectOptions = useMemo(() => {
    // Nếu không có dữ liệu hoặc mảng dữ liệu rỗng, trả về mảng rỗng
    if (!facilitiesData?.data?.length) return []

    const mappedFacilities = facilitiesData.data.map((facility) => {
      // 1. Trích xuất các thông tin cần thiết từ `facility.address`
      const fullAddress = facility.address?.fullAddress || 'N/A'
      const location = facility.address?.location

      let distance
      // 2. Tính khoảng cách nếu có vị trí người dùng và cơ sở có tọa độ
      if (userLocationForSorting && location?.coordinates) {
        const [lon, lat] = location.coordinates
        distance = getDistanceFromLatLonInKm(
          userLocationForSorting.lat,
          userLocationForSorting.lon,
          lat,
          lon
        )
      }

      // 3. Trả về object đã được cấu trúc lại đúng đắn
      return {
        value: facility._id,
        label: facility.facilityName,
        // Dùng `fullAddress` đã trích xuất, đây là một chuỗi (string)
        address: fullAddress,
        searchLabel: `${facility.facilityName} ${fullAddress}`,
        distance, // Sẽ là `undefined` nếu không tính được
      }
    })

    // Sắp xếp lại mảng nếu có thông tin vị trí người dùng
    if (userLocationForSorting) {
      mappedFacilities.sort((a, b) => {
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
    }

    return mappedFacilities
  }, [facilitiesData, userLocationForSorting]) // `useMemo` giờ phụ thuộc vào cả `userLocation`

  // === 7. TỰ ĐỘNG CHỌN CƠ SỞ GẦN NHẤT SAU KHI TÌM THẤY VỊ TRÍ ===
  useEffect(() => {
    // Chỉ chạy khi đã có vị trí VÀ danh sách đã được sắp xếp
    if (userLocationForSorting && selectOptions.length > 0) {
      const nearestFacility = selectOptions.find(
        (opt) => opt.distance !== undefined
      )
      if (nearestFacility) {
        setFacilityId(nearestFacility.value)
      }
    }
  }, [selectOptions, userLocationForSorting])

  const handleConfirmBooking = () => {
    if (selectedSlotId && shippingFee !== null) {
      // Gọi prop từ component cha với đầy đủ dữ liệu
      onConfirmBooking({
        slotId: selectedSlotId,
        shippingFee: shippingFee,
      })
      message.success('Đã gửi thông tin đặt lịch!')
    } else {
      message.error('Vui lòng tính phí vận chuyển trước khi xác nhận.')
    }
  }

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ width: 'fit-content', padding: 16 }}>
        <Title level={4}>Chọn lịch hẹn</Title>
        <Card style={{ marginBottom: 24, minWidth: 800 }}>
          <Row gutter={[16, 16]} align='bottom'>
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
                    facilitiesLoading ? (
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
              </div>
            </Col>
            <Col xs={24} md={6}>
              <Button
                type='primary'
                icon={<AimOutlined />}
                onClick={handleFindNearest}
                loading={isFindingLocation}
                title='Tìm cơ sở gần vị trí của bạn'
                style={{ width: '100%' }}
              >
                Tìm gần tôi
              </Button>
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
                    label: 'Phí dịch vụ',
                    value:
                      serviceDetail.fee +
                      serviceDetail.timeReturn.timeReturnFee +
                      serviceDetail.sample.fee,
                    isFee: true,
                  },
                  {
                    label: 'Phí vận chuyển',
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
                  disabled={!facilityId}
                >
                  Bắt buộc: Yêu cầu vị trí & Tính phí vận chuyển
                </Button>
                <Paragraph
                  type='secondary'
                  style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }}
                >
                  Bạn cần thực hiện bước này để ước tính tổng chi phí.
                </Paragraph>
              </>
            ) : (
              <Button
                type='primary'
                onClick={handleConfirmBooking}
                style={{ width: '100%', marginTop: 24, background: '#52c41a' }}
              >
                Xác nhận Đặt lịch
              </Button>
            )}
          </Card>
        )}
      </div>
    </ConfigProvider>
  )
}

export default BookingComponent
