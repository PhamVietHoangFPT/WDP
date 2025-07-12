import React, { useState } from 'react'
import {
  DatePicker,
  Select,
  Typography,
  Spin,
  Switch,
  Empty,
  Card,
  ConfigProvider,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import viVN from 'antd/locale/vi_VN'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useGetSlotsListQuery } from '../../features/admin/slotAPI'
import { useGetFacilitiesListQuery } from '../../features/admin/facilitiesAPI'
import type { Facility } from '../../types/facilities'
import type { Slot } from '../../types/slot'
import weekOfYear from 'dayjs/plugin/weekOfYear' // Thêm plugin này để đảm bảo 'startOf('week')' hoạt động tốt
import isBetween from 'dayjs/plugin/isBetween'
dayjs.locale('vi')
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const { Title } = Typography
const { Option } = Select

export interface FacilityListResponse {
  data: Facility[]
  isLoading: boolean
}

export type SlotListResponse = Slot[]

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

const SlotsFacilitiesCalendar: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ])
  const [selectedDisplayDate, setSelectedDisplayDate] =
    useState<dayjs.Dayjs | null>(dayjs().startOf('week'))

  const { data: facilitiesData, isLoading: facilitiesLoading } =
    useGetFacilitiesListQuery<FacilityListResponse>({
      pageNumber: 1,
      pageSize: 50,
    })

  const { data: slotsData, isLoading: slotsLoading } =
    useGetSlotsListQuery<SlotListResponse>(
      {
        pageNumber: 1,
        pageSize: 100,
        facilityId,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
        isAvailable,
      },
      {
        skip: !facilityId,
      }
    )

  const getWeekDates = () => {
    if (!dateRange[0]) return []
    const startOfWeek = dateRange[0].startOf('isoWeek') // ✅ Use ISO week
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'))
  }

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
      <div style={{ padding: 24 }}>
        <Title level={3}>
          Lịch slot theo tuần của cơ sở:{' '}
          {facilityId
            ? facilitiesData?.data?.find(
                (facility) => facility._id === facilityId
              )?.facilityName
            : '...'}
        </Title>
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <Select
            placeholder='Chọn cơ sở'
            style={{ width: 250 }}
            loading={facilitiesLoading}
            onChange={(value) => setFacilityId(value)}
            value={facilityId}
            allowClear
          >
            {facilitiesData?.data?.map((facility) => (
              <Option key={facility._id} value={facility._id}>
                {facility.facilityName}
              </Option>
            ))}
          </Select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() =>
                setDateRange(([start, end]) => [
                  start?.subtract(1, 'week') ?? null,
                  end?.subtract(1, 'week') ?? null,
                ])
              }
              style={{
                fontSize: 18,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              ←
            </button>

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
                if (
                  start &&
                  end &&
                  current.isBetween(start, end, 'day', '[]')
                ) {
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

            <button
              onClick={() =>
                setDateRange(([start, end]) => [
                  start?.add(1, 'week') ?? null,
                  end?.add(1, 'week') ?? null,
                ])
              }
              style={{
                fontSize: 18,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              →
            </button>
          </div>

          <div>
            <span style={{ marginRight: 8 }}>Chỉ hiển thị slot trống</span>
            <Switch
              checked={isAvailable}
              onChange={(checked) => setIsAvailable(checked)}
            />
          </div>
        </div>

        {!facilityId ? (
          <Empty description='Vui lòng chọn cơ sở để xem lịch slot' />
        ) : slotsLoading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Spin size='large' />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(7, 1fr)',
                gap: '1px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                overflow: 'hidden',
                minWidth: '800px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#fafafa',
                  padding: '12px 8px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid #d9d9d9',
                }}
              >
                Thời gian
              </div>

              {weekDates.map((date, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#fafafa',
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: index < 6 ? '1px solid #d9d9d9' : 'none',
                  }}
                >
                  <div>{DAYS_OF_WEEK[index]?.short}</div>
                  <div style={{ fontSize: '18px', marginTop: '4px' }}>
                    {date.format('DD')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {date.format('MM/YYYY')}
                  </div>
                </div>
              ))}

              {TIME_SLOTS.map((timeSlot, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  <div
                    style={{
                      backgroundColor: '#fafafa',
                      padding: '16px 8px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #d9d9d9',
                      borderTop: '1px solid #d9d9d9',
                    }}
                  >
                    {timeSlot.label}
                  </div>

                  {weekDates.map((date, dayIndex) => {
                    const daySlots = getSlotsForDayAndTime(date, timeSlot)
                    return (
                      <div
                        key={`${timeIndex}-${dayIndex}`}
                        style={{
                          backgroundColor: 'white',
                          padding: '8px',
                          minHeight: '80px',
                          borderRight:
                            dayIndex < 6 ? '1px solid #d9d9d9' : 'none',
                          borderTop: '1px solid #d9d9d9',
                        }}
                      >
                        {daySlots.map((slot) => (
                          <Card
                            key={slot._id}
                            size='small'
                            style={{
                              marginBottom: '0px',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#e6f7ff',
                              border: '1px solid #91d5ff',
                            }}
                            bodyStyle={{ padding: '4px 8px' }}
                          >
                            <div
                              style={{ fontSize: '12px', fontWeight: '500' }}
                            >
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </Card>
                        ))}

                        {daySlots.length === 0 && (
                          <div
                            style={{
                              color: '#bfbfbf',
                              fontSize: '12px',
                              textAlign: 'center',
                              paddingTop: '20px',
                            }}
                          >
                            Không có slot
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

export default SlotsFacilitiesCalendar
