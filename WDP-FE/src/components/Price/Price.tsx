'use client'

import React, { useState } from 'react'
import {
  Table,
  Typography,
  Spin,
  Pagination,
  Card,
  Tag,
  Divider,
  Row,
  Col,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useGetAllServiceCasePriceQuery } from '../../features/customer/price'

const { Title, Text } = Typography

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
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const {
    data: servicePricesResponse,
    isLoading,
    isFetching,
    error,
  } = useGetAllServiceCasePriceQuery({})

  const servicePrices = servicePricesResponse?.data || []
  const totalItems = servicePricesResponse?.pagination?.totalItems || 0

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = servicePrices.slice(startIndex, endIndex)

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
      render: (fee: number) => `${fee.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.fee - b.fee,
    },
    {
      title: 'Thời Gian Trả Kết Quả',
      key: 'timeReturn',
      render: (_, record) =>
        `${record.timeReturn?.timeReturn || 'N/A'} ngày`,
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
      title: 'Quan Hệ Huyết Thống',
      key: 'isAgnate',
      render: (_, record) => (
        <Tag color={record.isAgnate ? 'green' : 'orange'}>
          {record.isAgnate ? 'Có' : 'Không'}
        </Tag>
      ),
      filters: [
        { text: 'Có', value: true },
        { text: 'Không', value: false },
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

  const showTotal = (total: number, range: [number, number]) =>
    `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} dịch vụ`

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Danh sách các dịch vụ</Title>
      <Divider />
      {isLoading || isFetching ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' tip='Đang tải dữ liệu...' />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type='danger'>
            Có lỗi xảy ra khi tải dữ liệu: {error?.data?.message || 'Không xác định'}
          </Text>
        </div>
      ) : (
        <>
          <Table
            dataSource={paginatedData}
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