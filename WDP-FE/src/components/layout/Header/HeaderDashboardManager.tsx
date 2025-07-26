import { useEffect, useState } from 'react'
import { Header } from 'antd/es/layout/layout'
import { DatePicker, Button, Segmented, Space, ConfigProvider } from 'antd'
import { Dayjs } from 'dayjs'
import viVN from 'antd/locale/vi_VN' // Import locale tiếng Việt

// Để dayjs cũng hiển thị đúng tiếng Việt
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
dayjs.locale('vi')
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

export default function DashboardHeaderManager({
  onFilterChange,
  isLoading,
  initialFilters,
}: DashboardHeaderProps) {
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
          <ConfigProvider locale={viVN}>
            <DatePicker
              value={date}
              onChange={(d) => setDate(d!)}
              picker='month'
              placeholder='Chọn tháng' // Thêm placeholder tiếng Việt
            />
          </ConfigProvider>
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
        <Button type='primary' onClick={handleApplyFilters} loading={isLoading}>
          Xem
        </Button>
      </Space>
    </Header>
  )
}
