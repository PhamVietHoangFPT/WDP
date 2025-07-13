import React, { useState } from 'react'
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
} from 'antd'
import dayjs from 'dayjs'
import viVN from 'antd/locale/vi_VN'
import isoWeek from 'dayjs/plugin/isoWeek' // Giữ lại isoWeek nếu bạn muốn tuần ISO (Thứ 2 - CN)
import weekOfYear from 'dayjs/plugin/weekOfYear' // Thêm plugin này để đảm bảo 'startOf('week')' hoạt động tốt
import isBetween from 'dayjs/plugin/isBetween'
import {
  useGetFacilitiesNameAndAddressQuery,
  useGetFacilitiesListQuery,
} from '../../features/admin/facilitiesAPI'
import { useGetSlotsListQuery } from '../../features/admin/slotAPI'
import type { Slot } from '../../types/slot'

dayjs.locale('vi')
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const { Title } = Typography
const { Option } = Select

const TIME_SLOTS = [
  { label: '9:00 - 10:30', start: '09:00', end: '10:30' },
  { label: '10:30 - 12:00', start: '10:30', end: '12:00' },
  { label: '12:00 - 13:30', start: '12:00', end: '13:30' },
  { label: '13:30 - 15:00', start: '13:30', end: '15:00' },
  { label: '15:00 - 16:30', start: '15:00', end: '16:30' },
  { label: '16:30 - 18:00', start: '16:30', end: '18:00' },
]

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
  onSelectBooking: (slotId: string) => void
  selectedSlotId: string | null
}

const BookingComponent: React.FC<BookingComponentProps> = ({
  onSelectBooking,
  selectedSlotId,
}) => {
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ])
  // Giá trị cho DatePicker (chỉ cần 1 ngày để hiển thị trong input)
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))
  const { data: facilitiesData, isLoading: facilitiesLoading } =
    useGetFacilitiesNameAndAddressQuery({})

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
    (dateRange[0] || dayjs()).startOf('week').add(i, 'day')
  )

  // --- Hàm xử lý khi người dùng chọn một ngày từ DatePicker ---
  const handleDateSelect = (value: dayjs.Dayjs | null) => {
    if (value) {
      // Khi người dùng chọn 1 ngày, tính toán đầu và cuối tuần của ngày đó
      const startOfWeek = value.startOf('week')
      const endOfWeek = value.endOf('week')

      setDateRange([startOfWeek, endOfWeek]) // Cập nhật state dateRange với cả tuần
      setSelectedDisplayDate(value) // Cập nhật ngày hiển thị trong input của DatePicker
    } else {
      // Xử lý khi người dùng xóa lựa chọn (clear)
      setDateRange([null, null])
      setSelectedDisplayDate(null)
    }
  }

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ width: 'fit-content', padding: 16 }}>
        <Title level={4}>Chọn lịch hẹn</Title>

        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Select
            placeholder='Chọn cơ sở'
            style={{ width: 250 }}
            loading={facilitiesLoading}
            onChange={(val) => setFacilityId(val)}
            value={facilityId}
            allowClear
          >
            {facilitiesData?.data?.map((facility: any) => (
              <Option key={facility._id} value={facility._id}>
                {facility.address} - {facility.facilityName}
              </Option>
            ))}
          </Select>

          <DatePicker
            picker='date' // Hiển thị lịch theo ngày (không phải tuần)
            value={selectedDisplayDate} // Giá trị hiển thị trong ô input của DatePicker
            onChange={handleDateSelect} // Xử lý khi chọn ngày
            style={{ width: 220 }}
            // --- Tùy chỉnh để highlight cả tuần trong lịch ---
            dateRender={(current) => {
              const style: React.CSSProperties = {}
              const start = dateRange[0]
              const end = dateRange[1]

              // Nếu ngày hiện tại trong lịch nằm trong tuần đã chọn
              if (start && end && current.isBetween(start, end, 'day', '[]')) {
                style.backgroundColor = '#e6f7ff' // Màu nền highlight
                style.borderRadius = '4px' // Bo tròn nhẹ
                style.color = '#1890ff' // Màu chữ
                style.fontWeight = 'bold'
              }
              return (
                <div className='ant-picker-cell-inner' style={style}>
                  {current.date()}
                </div>
              )
            }}
          />

          <div>
            <span style={{ marginRight: 8 }}>Slot trống</span>
            <Switch checked={isAvailable} onChange={setIsAvailable} />
          </div>
        </div>

        {!facilityId ? (
          <Empty description='Chọn cơ sở để xem lịch' />
        ) : slotsLoading ? (
          <Spin />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(7, 1fr)',
                border: '1px solid #d9d9d9',
                minWidth: '800px',
              }}
            >
              <div
                style={{
                  background: '#fafafa',
                  padding: 8,
                  fontWeight: 'bold',
                }}
              >
                Thời gian
              </div>
              {weekDates.map((date, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fafafa',
                    padding: 8,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {DAYS_OF_WEEK[idx].short}
                  <br />
                  {date.format('DD/MM')}
                </div>
              ))}

              {TIME_SLOTS.map((timeSlot, row) => (
                <React.Fragment key={row}>
                  <div style={{ background: '#fafafa', padding: 8 }}>
                    {timeSlot.label}
                  </div>
                  {weekDates.map((date, col) => {
                    const slots = getSlotsForDayAndTime(date, timeSlot)
                    return (
                      <div
                        key={col}
                        style={{
                          border: '1px solid #f0f0f0',
                          minHeight: 60,
                          padding: 4,
                        }}
                      >
                        {slots.length > 0 ? (
                          slots.map((slot: Slot) => (
                            <Card
                              size='small'
                              key={slot._id}
                              style={{ marginBottom: 4 }}
                            >
                              <div style={{ fontSize: 12 }}>
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <Button
                                type='primary'
                                onClick={() => onSelectBooking(slot._id)}
                                disabled={selectedSlotId === slot._id}
                              >
                                Đặt lịch
                              </Button>
                            </Card>
                          ))
                        ) : (
                          <div
                            style={{
                              fontSize: 12,
                              color: '#bbb',
                              textAlign: 'center',
                            }}
                          >
                            -
                          </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  )
}

export default BookingComponent
