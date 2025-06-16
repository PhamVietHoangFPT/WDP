import type React from "react"
import { useState } from "react"
import { DatePicker, Select, Table, Typography, Spin, Switch, Empty } from "antd"
import dayjs from "dayjs"
import { useGetSlotsListQuery } from "../../features/admin/slotAPI" 
import { useGetFacilitiesListQuery } from "../../features/admin/facilitiesAPI"
import type { Facility } from "../../types/facilities"
import type { Slot } from "../../types/slot"

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker


export interface FacilityListResponse {
  data: Facility[];
  isLoading: boolean; 
}


export type SlotListResponse = Slot[]; 


const SlotsFacilitiesList: React.FC = () => {
  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ])

  const {
    data: facilitiesData,
    isLoading: facilitiesLoading,
  } = useGetFacilitiesListQuery<FacilityListResponse>({
    pageNumber: 1, 
    pageSize: 5, 
  })

  const {
    data: slotsData, 
    isLoading: slotsLoading,
  } = useGetSlotsListQuery<SlotListResponse>(
    {
      pageNumber: 1,
      pageSize: 5,
      facilityId,
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      isAvailable,
    },
    {
      skip: !facilityId, 
    }
  )

  const columns = [
    {
      title: "Ngày",
      dataIndex: "slotDate",
      key: "slotDate",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      key: "endTime",
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Danh sách Slot</Title>

      <div style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: 'flex-end' }}>
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
        />

        <div>
          <span style={{ marginRight: 8 }}>Chỉ hiển thị slot trống</span>
          <Switch checked={isAvailable} onChange={(checked) => setIsAvailable(checked)} />
        </div>
      </div>

      {!facilityId ? (
        <Empty description="Vui lòng chọn cơ sở để xem danh sách slot" />
      ) : slotsLoading ? (
        <Spin />
      ) : (
        <Table

          dataSource={slotsData || []} 
          columns={columns}
          rowKey="_id"
          locale={{ emptyText: "Không có slot nào được tìm thấy" }}
        />
      )}
    </div>
  )
}

export default SlotsFacilitiesList