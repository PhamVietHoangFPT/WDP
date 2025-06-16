import type React from "react"
import { useState } from "react"
import { DatePicker, Select, Table, Typography, Spin, Switch, Empty } from "antd"
import dayjs from "dayjs"
// Giữ nguyên các import ts của mày
import { useGetSlotsListQuery } from "../../features/admin/slotAPI" 
import { useGetFacilitiesListQuery } from "../../features/admin/facilitiesAPI"
import type { Facility } from "../../types/facilities"
import type { Slot } from "../../types/slot"

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// Giữ nguyên các interface mày đã cung cấp
export interface FacilityListResponse {
  data: Facility[];
  isLoading: boolean;
}

export interface SlotListResponse {
  data: {
    items: Slot[]
  }
  isLoading: boolean
}

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
    pageSize: 5, // Thường lấy đủ các cơ sở để đổ vào Select
  })

  // --- Chỗ sửa chính đây này ---
  // Truyền trực tiếp các tham số filter vào useGetSlotsListQuery
  const {
    data: slotsData,
    isLoading: slotsLoading,
  } = useGetSlotsListQuery<SlotListResponse>(
    {
      pageNumber: 1, // Mặc định pageNumber cho request này, mày có thể thêm state nếu cần phân trang
      pageSize: 100, // Mặc định pageSize, mày có thể điều chỉnh
      facilityId, // Tham số facilityId sẽ được gửi qua query params
      startDate: dateRange[0]?.format("YYYY-MM-DD"), // Tham số startDate
      endDate: dateRange[1]?.format("YYYY-MM-DD"),   // Tham số endDate
      isAvailable, // Tham số isAvailable
    },
    {
      // skip query nếu facilityId chưa được chọn
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
          // Đảm bảo lấy đúng mảng `items` từ trong `data` của `slotsData`
          dataSource={slotsData?.data?.items || []} 
          columns={columns}
          rowKey="_id"
          locale={{ emptyText: "Không có slot nào được tìm thấy" }}
        />
      )}
    </div>
  )
}

export default SlotsFacilitiesList