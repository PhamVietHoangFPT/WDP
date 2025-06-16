import React, { useState } from "react"
import { DatePicker, Select, Typography, Spin, Switch, Empty, Card, ConfigProvider } from "antd"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import viVN from "antd/locale/vi_VN"
import { useGetSlotsListQuery } from "../../features/admin/slotAPI"
import { useGetFacilitiesListQuery } from "../../features/admin/facilitiesAPI"
import type { Facility } from "../../types/facilities"
import type { Slot } from "../../types/slot"

dayjs.locale("vi") // Set dayjs locale to Vietnamese

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

export interface FacilityListResponse {
  data: Facility[]
  isLoading: boolean
}

export type SlotListResponse = Slot[]

// Time slots of 1.5 hours
const TIME_SLOTS = [
  { label: "9:00 - 10:30", start: "09:00", end: "10:30" },
  { label: "10:30 - 12:00", start: "10:30", end: "12:00" },
  { label: "13:00 - 14:30", start: "13:00", end: "14:30" },
  { label: "14:30 - 16:00", start: "14:30", end: "16:00" },
  { label: "16:00 - 17:30", start: "16:00", end: "17:30" },
]

const DAYS_OF_WEEK = [
  { key: "monday", label: "THỨ HAI", short: "T2" },
  { key: "tuesday", label: "THỨ BA", short: "T3" },
  { key: "wednesday", label: "THỨ TƯ", short: "T4" },
  { key: "thursday", label: "THỨ NĂM", short: "T5" },
  { key: "friday", label: "THỨ SÁU", short: "T6" },
  { key: "saturday", label: "THỨ BẢY", short: "T7" },
  { key: "sunday", label: "CHỦ NHẬT", short: "CN" },
]

const SlotsFacilitiesCalendar: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf("week").add(1, "day"),
    dayjs().endOf("week"),
  ])

  const { data: facilitiesData, isLoading: facilitiesLoading } = useGetFacilitiesListQuery<FacilityListResponse>({
    pageNumber: 1,
    pageSize: 50,
  })

  const { data: slotsData, isLoading: slotsLoading } = useGetSlotsListQuery<SlotListResponse>(
    {
      pageNumber: 1,
      pageSize: 100,
      facilityId,
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      isAvailable,
    },
    {
      skip: !facilityId,
    },
  )

  const getSlotsForDayAndTime = (dayDate: dayjs.Dayjs, timeSlot: (typeof TIME_SLOTS)[0]) => {
    if (!slotsData) return []
    return slotsData.filter((slot) => {
      const slotDate = dayjs(slot.slotDate)
      const isSameDay = slotDate.isSame(dayDate, "day")
      const isInTimeRange = slot.startTime >= timeSlot.start && slot.startTime < timeSlot.end
      return isSameDay && isInTimeRange
    })
  }

  const getWeekDates = () => {
    if (!dateRange[0]) return []
    const startOfWeek = dateRange[0].startOf("week").add(1, "day")
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"))
  }

  const weekDates = getWeekDates()

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ padding: 24 }}>
        <Title level={3}>Lịch slot theo tuần của cơ sở: {facilityId ? facilitiesData?.data?.find(facility => facility._id === facilityId)?.facilityName : "..."}</Title>
        <div style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select
            placeholder="Chọn cơ sở"
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

          <RangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            picker="week"
            format="DD/MM/YYYY"
            style={{ width: 200 }}
          />

          <div>
            <span style={{ marginRight: 8 }}>Chỉ hiển thị slot trống</span>
            <Switch checked={isAvailable} onChange={(checked) => setIsAvailable(checked)} />
          </div>
        </div>

        {!facilityId ? (
          <Empty description="Vui lòng chọn cơ sở để xem lịch slot" />
        ) : slotsLoading ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(7, 1fr)",
                gap: "1px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                overflow: "hidden",
                minWidth: "800px",
              }}
            >
              {/* Header Row */}
              <div
                style={{
                  backgroundColor: "#fafafa",
                  padding: "12px 8px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: "1px solid #d9d9d9",
                }}
              >
                Thời gian
              </div>

              {weekDates.map((date, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#fafafa",
                    padding: "12px 8px",
                    fontWeight: "bold",
                    textAlign: "center",
                    borderRight: index < 6 ? "1px solid #d9d9d9" : "none",
                  }}
                >
                  <div>{DAYS_OF_WEEK[index]?.short}</div>
                  <div style={{ fontSize: "18px", marginTop: "4px" }}>{date.format("DD")}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{date.format("MM/YYYY")}</div>
                </div>
              ))}

              {TIME_SLOTS.map((timeSlot, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "16px 8px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: "1px solid #d9d9d9",
                      borderTop: "1px solid #d9d9d9",
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
                          backgroundColor: "white",
                          padding: "8px",
                          minHeight: "80px",
                          borderRight: dayIndex < 6 ? "1px solid #d9d9d9" : "none",
                          borderTop: "1px solid #d9d9d9",
                        }}
                      >
                        {daySlots.map((slot) => (
                          <Card
                            key={slot._id}
                            size="small"
                            style={{
                              marginBottom: "0px",
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#e6f7ff",
                              border: "1px solid #91d5ff",
                            }}
                            bodyStyle={{ padding: "4px 8px" }}
                          >
                            <div style={{ fontSize: "12px", fontWeight: "500" }}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </Card>
                        ))}

                        {daySlots.length === 0 && (
                          <div
                            style={{
                              color: "#bfbfbf",
                              fontSize: "12px",
                              textAlign: "center",
                              paddingTop: "20px",
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
