import { useState, useEffect, useMemo } from 'react'
import { Spin, Alert, Row, Col, Card, Statistic } from 'antd'
import {
  UserOutlined,
  FileDoneOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
// Import các hook API của bạn (giữ nguyên)
import {
  useGetDashboardDataByDateQuery,
  useGetDashboardDataByWeekQuery,
  useGetDashboardDataByMonthQuery,
  useGetDashboardDataByQuarterQuery,
  useGetDashboardDataByYearQuery,
} from '../../features/dashboard/dashboardAPI'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import { BarChart } from '@mui/x-charts/BarChart'
dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)
import Cookies from 'js-cookie'
import DashboardHeaderManager from '../../components/layout/Header/HeaderDashboardManager'

const ManagerHomePage = () => {
  const userData = Cookies.get('userData')
  const user = userData ? JSON.parse(userData) : null
  const facilityId = user?.facility._id || null
  const [apiParams, setApiParams] = useState<any>({ viewMode: 'today' })
  const [dashboardData, setDashboardData] = useState<any>(null)

  // Tạo một object chứa các tham số chung
  const baseParams = {
    date: apiParams.date,
    week: apiParams.week,
    month: apiParams.month,
    quarter: apiParams.quarter,
    year: apiParams.year,
    // ✅ Chỉ thêm facilityId vào object nếu nó có giá trị
    ...(facilityId && { facilityId }),
  }

  const {
    data: todayData,
    isLoading: todayLoading,
    isError: todayError,
  } = useGetDashboardDataByDateQuery(baseParams, {
    skip: apiParams.viewMode !== 'today' && apiParams.viewMode !== 'day',
  })

  const {
    data: weekData,
    isLoading: weekLoading,
    isError: weekError,
  } = useGetDashboardDataByWeekQuery(baseParams, {
    skip: apiParams.viewMode !== 'week',
  })

  const {
    data: monthData,
    isLoading: monthLoading,
    isError: monthError,
  } = useGetDashboardDataByMonthQuery(baseParams, {
    skip: apiParams.viewMode !== 'month',
  })

  const {
    data: quarterData,
    isLoading: quarterLoading,
    isError: quarterError,
  } = useGetDashboardDataByQuarterQuery(baseParams, {
    skip: apiParams.viewMode !== 'quarter',
  })

  const {
    data: yearData,
    isLoading: yearLoading,
    isError: yearError,
  } = useGetDashboardDataByYearQuery(baseParams, {
    skip: apiParams.viewMode !== 'year',
  })
  const isLoading =
    todayLoading || weekLoading || monthLoading || quarterLoading || yearLoading
  const isError =
    todayError || weekError || monthError || quarterError || yearError

  useEffect(() => {
    switch (apiParams.viewMode) {
      case 'today':
        setDashboardData(todayData)
        break
      case 'day':
        setDashboardData(todayData)
        break
      case 'week':
        setDashboardData(weekData)
        break
      case 'month':
        setDashboardData(monthData)
        break
      case 'quarter':
        setDashboardData(quarterData)
        break
      case 'year':
        setDashboardData(yearData)
        break
      default:
        setDashboardData(null)
    }
  }, [
    todayData,
    weekData,
    monthData,
    quarterData,
    yearData,
    apiParams.viewMode,
  ])

  const formatLargeNumber = (value: number | null): string => {
    if (value === null || value === undefined) return ''

    const oneBillion = 1000000000
    const oneMillion = 1000000

    // Nếu giá trị lớn hơn hoặc bằng 1 tỷ
    if (Math.abs(value) >= oneBillion) {
      // Chia cho 1 tỷ, làm tròn 2 chữ số thập phân và thay thế dấu phẩy
      const result = (value / oneBillion).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })

      return `${result} tỷ`
    }

    // Nếu giá trị lớn hơn hoặc bằng 1 triệu
    if (Math.abs(value) >= oneMillion) {
      // Chia cho 1 triệu và làm tròn
      const result = Math.round(value / oneMillion)
      return `${result} tr`
    }

    // Nếu nhỏ hơn 1 triệu, hiển thị bình thường
    return `${value.toLocaleString('vi-VN')} ₫`
  }

  const handleFilterChange = (filters: any) => {
    if (filters.viewMode === 'today') {
      setApiParams({ viewMode: 'today', facilityId: filters.facilityId })
      return
    }
    const newParams = {
      viewMode: filters.viewMode,
      facilityId: filters.facilityId,
      year: filters.date.year(),
      month: filters.date.month() + 1,
      week: filters.date.isoWeek(),
      quarter: filters.date.quarter(),
      date: filters.date.format('YYYY-MM-DD'),
    }
    setApiParams(newParams)
  }

  const initialFilters = useMemo(
    () => ({
      viewMode: apiParams.viewMode,
      facilityId: apiParams.facilityId,
      date: apiParams.date ? dayjs(apiParams.date) : dayjs(),
    }),
    [apiParams]
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size='large' />
        </div>
      )
    }
    if (isError) {
      return (
        <Alert
          message='Lỗi'
          description='Không thể tải dữ liệu dashboard.'
          type='error'
          showIcon
        />
      )
    }
    if (!dashboardData || !dashboardData.data.statistics) {
      return (
        <Alert
          message='Không có dữ liệu'
          description='Không tìm thấy dữ liệu cho khoảng thời gian đã chọn.'
          type='info'
          showIcon
        />
      )
    }

    const stats = dashboardData.data.statistics

    // ✅ BIẾN ĐỔI DỮ LIỆU CHO MUI CHARTS
    const revenueChartData = {
      dates: stats.revenueByDate.map((d: any) => d.date),
      // ✅ Sửa lại 'd.revenue' thành 'd.totalRevenueByDate'
      revenues: stats.revenueByDate.map((d: any) => d.totalRevenueByDate),
    }

    // Phần này đã đúng vì d.count khớp với dữ liệu
    const serviceCasesChartData = {
      dates: stats.serviceCasesByDate.map((d: any) => d.date),
      counts: stats.serviceCasesByDate.map((d: any) => d.count),
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Tổng doanh thu'
                value={stats.totalRevenue || 0}
                precision={0}
                prefix={<DollarCircleOutlined />}
                suffix='₫'
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Tổng hồ sơ'
                value={stats.totalServiceCases || 0}
                prefix={<FileDoneOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Tổng bệnh nhân'
                value={stats.totalPatients || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Bệnh nhân quay lại'
                value={stats.returningPatients || 0}
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Thanh toán thành công'
                value={stats.successfulPayments || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Thanh toán thất bại'
                value={stats.failedPayments || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Doanh thu phụ phí'
                value={stats.totalExtraFee || 0}
                precision={0}
                prefix={<DollarCircleOutlined />}
                suffix='₫'
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title='Tổng cơ sở'
                value={stats.totalFacilities || 0}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* ✅ HÀNG CHỨA BIỂU ĐỒ (CẬP NHẬT) */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title='Biểu đồ doanh thu'>
              <BarChart
                height={300}
                yAxis={[
                  {
                    valueFormatter: formatLargeNumber,
                  },
                ]}
                xAxis={[{ data: revenueChartData.dates, scaleType: 'band' }]}
                series={[
                  {
                    data: revenueChartData.revenues,
                    label: 'Doanh thu',
                    valueFormatter: formatLargeNumber,
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title='Biểu đồ số lượng hồ sơ'>
              <BarChart
                height={300}
                xAxis={[
                  { data: serviceCasesChartData.dates, scaleType: 'band' },
                ]}
                series={[
                  {
                    data: serviceCasesChartData.counts,
                    label: 'Số hồ sơ',
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <DashboardHeaderManager
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        initialFilters={initialFilters}
      />
      <div style={{ padding: 24 }}>{renderContent()}</div>
    </>
  )
}

export default ManagerHomePage
