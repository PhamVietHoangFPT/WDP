import React, { useState } from 'react'
import {
  Table,
  Typography,
  Spin,
  Pagination,
  Tag,
  Divider,
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useGetAllServiceCasePriceQuery } from '../../features/customer/price'

const { Title, Text } = Typography
const { Option } = Select

interface ServicePrice {
  _id: string
  fee: number
  timeReturn: {
    timeReturn: number
    timeReturnFee: number
  }
  sample: {
    name: string
    fee: number
  }
  isAdministration: boolean
  isAgnate: boolean
  name?: string
  isSelfSampling?: boolean
}

const Price: React.FC = () => {
  const [form] = Form.useForm()
  // Sửa lỗi cú pháp: chỉ cần một lần khai báo currentPage
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [filters, setFilters] = useState({
    name: '',
    sampleName: '',
    timeReturn: undefined,
    isSelfSampling: undefined,
    isAdministration: undefined,
    isAgnate: undefined,
  })

  const queryParams = Object.fromEntries(
    Object.entries({
      ...filters,
      pageNumber: currentPage,
      pageSize: pageSize,
    }).filter(
      ([_, value]) => value !== undefined && value !== '' && value !== null
    )
  )

  const {
    data: servicePricesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllServiceCasePriceQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  })

  const handleSearch = (values: any) => {
    setFilters({
      name: values.name || '',
      sampleName: values.sampleName || '',
      timeReturn: values.timeReturn || undefined,
      isSelfSampling: values.isSelfSampling,
      isAdministration: values.isAdministration,
      isAgnate: values.isAgnate,
    })
    setCurrentPage(1)
  }

  const handleClear = () => {
    form.resetFields()
    setFilters({
      name: '',
      sampleName: '',
      timeReturn: undefined,
      isSelfSampling: undefined,
      isAdministration: undefined,
      isAgnate: undefined,
    })
    setCurrentPage(1)
    refetch()
  }

  const servicePrices = servicePricesResponse?.data || []
  const totalItems = servicePricesResponse?.pagination?.totalItems || 0

  const showTotal = (total: number, range: [number, number]) =>
    `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} dịch vụ`

  // Hàm tính tổng giá tiền
  const calculateTotalPrice = (record: ServicePrice) => {
    const serviceFee = record.fee || 0
    const sampleFee = record.sample?.fee || 0
    const timeReturnFee = record.timeReturn?.timeReturnFee || 0
    return serviceFee + sampleFee + timeReturnFee
  }

  const columns: ColumnsType<ServicePrice> = [
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Loại Mẫu',
      key: 'sample',
      render: (_, record) => record.sample?.name || 'N/A',
    },
    {
      title: 'Phí Dịch Vụ',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee: number) => (
        <strong>{fee.toLocaleString('vi-VN')} VNĐ</strong>
      ),
      sorter: (a, b) => a.fee - b.fee,
    },
    {
      title: 'Tổng Giá Tiền',
      key: 'totalPrice',
      render: (_, record) => (
        <Tooltip
          title={
            <>
              <div>Phí dịch vụ: {record.fee.toLocaleString('vi-VN')} VNĐ</div>
              <div>
                Phí lấy mẫu: {record.sample?.fee.toLocaleString('vi-VN')} VNĐ
              </div>
              <div>
                Phí trả nhanh:{' '}
                {record.timeReturn?.timeReturnFee.toLocaleString('vi-VN')} VNĐ
              </div>
            </>
          }
        >
          <strong>
            {calculateTotalPrice(record).toLocaleString('vi-VN')} VNĐ
          </strong>
        </Tooltip>
      ),
      sorter: (a, b) => calculateTotalPrice(a) - calculateTotalPrice(b),
    },
    {
      title: 'Thời Gian Trả Kết Quả',
      key: 'timeReturn',
      render: (_, record) => `${record.timeReturn?.timeReturn || 'N/A'} ngày`,
      sorter: (a, b) => a.timeReturn.timeReturn - b.timeReturn.timeReturn,
    },
    {
      title: 'Dân Sự / Hành Chính',
      key: 'isAdministration',
      render: (_, record) => (
        <Tag color={record.isAdministration ? 'blue' : 'geekblue'}>
          {record.isAdministration ? 'Hành Chính' : 'Dân Sự'}
        </Tag>
      ),
      filters: [
        { text: 'Hành Chính', value: true },
        { text: 'Dân Sự', value: false },
      ],
      onFilter: (value, record) => record.isAdministration === value,
    },
    {
      title: 'Nội/Ngoại',
      key: 'isAgnate',
      render: (_, record) => (
        <Tag color={record.isAgnate ? 'green' : 'orange'}>
          {record.isAgnate ? 'Nội' : 'Ngoại'}
        </Tag>
      ),
      filters: [
        { text: 'Nội', value: true },
        { text: 'Ngoại', value: false },
      ],
      onFilter: (value, record) => record.isAgnate === value,
    },
    {
      title: 'Tự Lấy Mẫu',
      key: 'isSelfSampling',
      render: (_, record) => (
        <Tag color={record.isSelfSampling ? 'cyan' : 'red'}>
          {record.isSelfSampling ? 'Có' : 'Không'}
        </Tag>
      ),
      filters: [
        { text: 'Có', value: true },
        { text: 'Không', value: false },
      ],
      onFilter: (value, record) => record.isSelfSampling === value,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Danh sách các dịch vụ</Title>
      <Divider />

      <Card style={{ marginBottom: 24 }}>
        <Form form={form} layout='vertical' onFinish={handleSearch}>
          <Space wrap>
            <Form.Item name='name' label='Tên Dịch Vụ'>
              <Input placeholder='Nhập tên dịch vụ' style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name='sampleName' label='Tên Mẫu'>
              <Input placeholder='Nhập tên mẫu' style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name='timeReturn' label='Thời gian trả kết quả'>
              <Input
                placeholder='Số ngày'
                type='number'
                style={{ width: 200 }}
              />
            </Form.Item>
            <Form.Item name='isSelfSampling' label='Tự Lấy Mẫu'>
              <Select placeholder='Tất cả' style={{ width: 150 }} allowClear>
                <Option value={true}>Có</Option>
                <Option value={false}>Không</Option>
              </Select>
            </Form.Item>
            <Form.Item name='isAdministration' label='Pháp Lý'>
              <Select placeholder='Tất cả' style={{ width: 150 }} allowClear>
                <Option value={true}>Hành Chính</Option>
                <Option value={false}>Dân Sự</Option>
              </Select>
            </Form.Item>
            <Form.Item name='isAgnate' label='Quan Hệ'>
              <Select placeholder='Tất cả' style={{ width: 150 }} allowClear>
                <Option value={true}>Nội</Option>
                <Option value={false}>Ngoại</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space style={{ marginTop: 30}}>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleClear} icon={<ReloadOutlined />}>
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </Card>

      {isLoading || isFetching ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' tip='Đang tải dữ liệu...' />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type='danger'>
            Có lỗi xảy ra khi tải dữ liệu:{' '}
            {error?.data?.message || 'Không xác định'}
          </Text>
        </div>
      ) : (
        <>
          <Table
            dataSource={servicePrices}
            columns={columns}
            rowKey='_id'
            pagination={false}
            scroll={{ x: 'max-content' }}
            style={{ marginBottom: 20 }}
            locale={{ emptyText: 'Không có dịch vụ nào' }}
          />
          {totalItems > 0 && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              showSizeChanger
              showTotal={showTotal}
              pageSizeOptions={['5', '10', '20', '50']}
              style={{
                marginTop: '20px',
                textAlign: 'center',
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Price
