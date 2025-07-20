import React, { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Input,
  Select,
  Form,
  Pagination,
  Result,
  Flex,
  Typography,
  Tag,
  Space,
  Statistic,
} from 'antd'
import type { Service } from '../../types/service'
import { useGetServiceListQuery } from '../../features/service/serviceAPI'
import './AtHomeRegisteration.css'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useDebounce from '../../hooks/useDebounce'
import type { ErrorResponse } from '../../types/error'
// Kiểu dữ liệu response
interface ServiceListResponse {
  data: {
    data: Service[]
    pagination: {
      totalItems: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }
  isLoading: boolean
  isError: boolean
  error: ErrorResponse | null
}

const AtHomeRegisteration: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // State cục bộ và debounce
  const [localSearchTerm, setLocalSearchTerm] = useState(
    searchParams.get('name') || ''
  )
  const [localSampleName, setLocalSampleName] = useState(
    searchParams.get('sampleName') || ''
  )
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500)
  const debouncedSampleName = useDebounce(localSampleName, 500)

  // Tham số truy vấn
  const queryParams = useMemo(
    () => ({
      name: debouncedSearchTerm || undefined,
      sampleName: debouncedSampleName || undefined,
      isSelfSampling: searchParams.get('isSelfSampling') || undefined,
      isAgnate: searchParams.get('isAgnate') || undefined,
      pageNumber: Number(searchParams.get('pageNumber')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      isAdministration: false,
    }),
    [searchParams, debouncedSearchTerm, debouncedSampleName]
  )

  // Effect cập nhật URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (debouncedSearchTerm) newParams.set('name', debouncedSearchTerm)
    else newParams.delete('name')
    if (debouncedSampleName) newParams.set('sampleName', debouncedSampleName)
    else newParams.delete('sampleName')

    if (
      searchParams.get('name') !== debouncedSearchTerm ||
      searchParams.get('sampleName') !== debouncedSampleName
    ) {
      if (newParams.has('pageNumber')) {
        newParams.set('pageNumber', '1')
      }
    }
    setSearchParams(newParams, { replace: true })
  }, [debouncedSearchTerm, debouncedSampleName, searchParams, setSearchParams])

  // Gọi API
  const { data, isLoading, isError, error } =
    useGetServiceListQuery<ServiceListResponse>(queryParams)

  const dataService = data?.data || []
  const totalItems = data?.pagination?.totalItems || 0

  // Các hàm xử lý sự kiện
  const handleRegisterClick = (serviceId: string) => {
    navigate(`/register-service-at-home/${serviceId}`)
  }

  const handleFilterChange = (
    key: string,
    value: string | number | boolean | undefined
  ) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === undefined || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'pageNumber' && key !== 'pageSize') {
      newParams.set('pageNumber', '1')
    }
    setSearchParams(newParams)
  }

  // Hàm render nội dung chính dựa trên trạng thái
  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <Spin size='large' />
        </div>
      )
    }

    if (isError) {
      return (
        <Result
          status='error'
          title='Lỗi khi tải dữ liệu'
          subTitle={
            error?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.'
          }
        />
      )
    }

    if (dataService.length === 0) {
      return (
        <Result
          status='404'
          title='Không tìm thấy dịch vụ phù hợp'
          subTitle='Vui lòng thử lại với các bộ lọc khác.'
        />
      )
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          {dataService.map((service) => (
            <Col key={service._id} xs={24} sm={12} md={8}>
              <Card hoverable className='service-card'>
                <Card.Meta
                  title={
                    <Flex gap='middle' align='start' justify='space-between'>
                      {/* Phần thông tin chính bên trái */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography.Title
                          level={5}
                          style={{ marginTop: 0, marginBottom: 4 }}
                          ellipsis={{ tooltip: service.name }}
                        >
                          {service.name}
                        </Typography.Title>
                        <Typography.Text
                          type='secondary'
                          ellipsis={{ tooltip: `Mẫu: ${service.sample.name}` }}
                        >
                          Mẫu: {service.sample.name}
                        </Typography.Text>
                      </div>

                      {/* Phần tag trạng thái bên phải */}
                      <Tag icon={<UserOutlined />} color='blue'>
                        Dân sự
                      </Tag>
                    </Flex>
                  }
                  description={
                    <Space
                      direction='vertical'
                      size='middle'
                      style={{ width: '100%', marginTop: 12 }}
                    >
                      {/* Dòng 1: Thông tin về huyết thống */}
                      <Space>
                        <Typography.Text type='secondary'>
                          Quan hệ:
                        </Typography.Text>
                        <Tag color={service.isAgnate ? 'blue' : 'purple'}>
                          {service.isAgnate ? 'Bên nội' : 'Bên ngoại'}
                        </Tag>
                      </Space>

                      {/* Dòng 2: Hiển thị giá bằng component Statistic */}
                      <Statistic
                        title='Chi phí tham khảo'
                        value={
                          (service.fee || 0) +
                          (service.timeReturn?.timeReturnFee || 0) +
                          (service.sample?.fee || 0)
                        }
                        precision={0} // Không hiển thị số thập phân
                        valueStyle={{ color: '#1565C0', fontSize: '1.3rem' }} // Tùy chỉnh màu và kích thước
                        suffix='₫'
                      />
                    </Space>
                  }
                />
                <div style={{ marginTop: '10px' }}>
                  <Button
                    type='primary'
                    className='register-button'
                    style={{ marginRight: '8px' }}
                    onClick={() => handleRegisterClick(service._id)}
                  >
                    Đăng ký
                  </Button>
                  <Button type='default' className='detail-button'>
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '24px',
          }}
        >
          <Pagination
            current={queryParams.pageNumber}
            pageSize={queryParams.pageSize}
            total={totalItems}
            onChange={(page, pageSize) => {
              handleFilterChange('pageNumber', page)
              handleFilterChange('pageSize', pageSize)
            }}
            showSizeChanger
          />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Title Section */}
      <div className='title-section'>
        <h1>DỊCH VỤ CỦA CHÚNG TÔI</h1>
        <p>Tổng hợp các dịch vụ xét nghiệm ADN dân sự</p>
        <span className='dna-icon'>🧬</span>
      </div>

      {/* Filter Section - Luôn hiển thị */}
      <Card style={{ marginBottom: '24px' }}>
        <Form layout='vertical'>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tên dịch vụ'>
                <Input
                  placeholder='Nhập tên dịch vụ'
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tên mẫu'>
                <Input
                  placeholder='Nhập tên mẫu'
                  value={localSampleName}
                  onChange={(e) => setLocalSampleName(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Quan hệ huyết thống'>
                <Select
                  value={queryParams.isAgnate}
                  onChange={(value) => handleFilterChange('isAgnate', value)}
                  allowClear
                  placeholder='Tất cả'
                >
                  <Select.Option value='true'>Bên nội</Select.Option>
                  <Select.Option value='false'>Bên ngoại</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label='Tự lấy mẫu'>
                <Select
                  value={queryParams.isSelfSampling}
                  onChange={(value) =>
                    handleFilterChange('isSelfSampling', value)
                  }
                  allowClear
                  placeholder='Tất cả'
                >
                  <Select.Option value='true'>Có</Select.Option>
                  <Select.Option value='false'>Không</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Service Cards Container - Nội dung thay đổi dựa trên trạng thái */}
      <div className='service-container'>{renderContent()}</div>
    </>
  )
}

export default AtHomeRegisteration
