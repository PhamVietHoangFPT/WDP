import React, { useEffect, useState } from 'react'
import { Header } from 'antd/es/layout/layout'
import { DatePicker, Select, Button, Segmented, Space } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useGetFacilitiesNameAndAddressQuery } from '../../../features/admin/facilitiesAPI'
const { Option } = Select

interface DashboardFilters {
  viewMode: string
  date: Dayjs
  facilityId?: string | null
}

interface DashboardHeaderProps {
  onFilterChange: (filters: DashboardFilters) => void
  isLoading: boolean
  initialFilters: any
}

export default function DashboardHeaderAdmin({
  onFilterChange,
  isLoading,
  initialFilters,
}: DashboardHeaderProps) {
  const { data: facilitiesData, isLoading: facilitiesLoading } =
    useGetFacilitiesNameAndAddressQuery({})
  const [viewMode, setViewMode] = useState<string>(
    initialFilters.viewMode || 'today'
  )
  const [date, setDate] = useState<Dayjs>(initialFilters.date || dayjs())
  const [facilityId, setFacilityId] = useState<string | null>(
    initialFilters.facilityId || null
  )

  // ✅ 3. DÙNG useEffect ĐỂ ĐỒNG BỘ KHI URL THAY ĐỔI
  useEffect(() => {
    setViewMode(initialFilters.viewMode || 'today')
    setDate(initialFilters.date || dayjs())
    setFacilityId(initialFilters.facilityId || null)
  }, [initialFilters]) // Effect này sẽ chạy lại mỗi khi initialFilters từ cha thay đổi

  const handleApplyFilters = () => {
    onFilterChange({ viewMode, date, facilityId })
  }

  const renderDatePicker = () => {
    switch (viewMode) {
      case 'week':
        return (
          <DatePicker
            value={date}
            onChange={(d) => setDate(d!)}
            picker='week'
          />
        )
      case 'month':
        return (
          <DatePicker
            value={date}
            onChange={(d) => setDate(d!)}
            picker='month'
          />
        )
      case 'quarter':
        return (
          <DatePicker
            value={date}
            onChange={(d) => setDate(d!)}
            picker='quarter'
          />
        )
      case 'year':
        return (
          <DatePicker
            value={date}
            onChange={(d) => setDate(d!)}
            picker='year'
          />
        )
      case 'day':
        return <DatePicker value={date} onChange={(d) => setDate(d!)} />
      default:
        return null // Không hiển thị DatePicker cho 'today'
    }
  }

  return (
    <Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        height: 'auto',
        padding: '12px 24px',
      }}
    >
      <Space wrap>
        <Segmented
          options={[
            { label: 'Hôm nay', value: 'today' },
            { label: 'Theo ngày', value: 'day' },
            { label: 'Theo tuần', value: 'week' },
            { label: 'Theo tháng', value: 'month' },
            { label: 'Theo quý', value: 'quarter' },
            { label: 'Theo năm', value: 'year' },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value)}
        />

        {renderDatePicker()}

        <Select
          style={{ width: 200 }}
          placeholder='Tất cả cơ sở'
          allowClear
          // ✅ Cập nhật `value`: Nếu `facilityId` là null, coi nó là chuỗi rỗng để khớp với Option "Tất cả"
          value={facilityId ?? ''}
          onChange={(val) => {
            // ✅ Cập nhật `onChange`: Nếu người dùng chọn Option rỗng, set state về null
            setFacilityId(val === '' ? null : val)
          }}
          loading={facilitiesLoading}
        >
          {/* ✅ Thêm lựa chọn "Tất cả cơ sở" ở đây */}
          <Option key='all-facilities' value=''>
            Tất cả cơ sở
          </Option>

          {facilitiesData?.data?.map((f: any) => (
            <Option key={f._id} value={f._id}>
              {f.facilityName}
            </Option>
          ))}
        </Select>

        <Button type='primary' onClick={handleApplyFilters} loading={isLoading}>
          Xem
        </Button>
      </Space>
    </Header>
  )
}
