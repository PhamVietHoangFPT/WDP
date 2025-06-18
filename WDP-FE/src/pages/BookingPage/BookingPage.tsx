// src/pages/BookingPage.tsx
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
import isoWeek from 'dayjs/plugin/isoWeek'
import { useNavigate } from 'react-router-dom'
import { useGetFacilitiesListQuery } from '../../features/admin/facilitiesAPI'
import { useGetSlotsListQuery } from '../../features/admin/slotAPI'
import type { Facility } from '../../types/facilities'
import type { Slot } from '../../types/slot'

dayjs.locale('vi')
dayjs.extend(isoWeek)

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

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

const BookingPage: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState(true)
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('isoWeek'),
    dayjs().endOf('isoWeek'),
  ])
  const navigate = useNavigate()

  const { data: facilitiesData, isLoading: facilitiesLoading } =
    useGetFacilitiesListQuery({ pageNumber: 1, pageSize: 50 })

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
    return slotsData.filter((slot) => {
      const slotDate = dayjs(slot.slotDate)
      return (
        slotDate.isSame(dayDate, 'day') &&
        slot.startTime >= timeSlot.start &&
        slot.startTime < timeSlot.end
      )
    })
  }

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    dateRange[0].startOf('isoWeek').add(i, 'day')
  )

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ padding: 24 }}>
        <Title level={3}>Đặt lịch hẹn</Title>

        <div
          style={{
            marginBottom: 24,
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
            {facilitiesData?.data?.map((facility: Facility) => (
              <Option key={facility._id} value={facility._id}>
                {facility.facilityName}
              </Option>
            ))}
          </Select>

          <RangePicker
            picker='week'
            value={dateRange}
            onChange={(val) => setDateRange(val as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: 220 }}
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
                                onClick={() => {
                                  const facilityObj =
                                    facilitiesData?.data?.find(
                                      (f) => f._id === facilityId
                                    )

                                  navigate('/payment', {
                                    state: {
                                      slot: {
                                        ...slot,
                                        facility: {
                                          _id: facilityObj?._id,
                                          facilityName:
                                            facilityObj?.facilityName ||
                                            'Không rõ',
                                        },
                                      },
                                    },
                                  })
                                }}
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

export default BookingPage
