import { useGetServiceListQuery } from '../../../features/service/serviceAPI'
import { useSearchParams } from 'react-router-dom'
import { Button, Pagination, Popconfirm, Space, Table } from 'antd'
import type { Service } from '../../../types/service'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { Spin } from 'antd'
import './AdminService.css'
import { useNavigate } from 'react-router-dom'
export default function ServiceList() {
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || 1
  const pageSize = searchParams.get('pageSize') || 10
  const navigate = useNavigate()
  const { data, isLoading } = useGetServiceListQuery({
    pageNumber,
    pageSize,
  })

  // Hàm trợ giúp để định dạng tiền tệ cho gọn
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '-'
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }

  const columns = [
    {
      title: 'Phí Dịch Vụ',
      dataIndex: 'fee',
      key: 'fee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Loại Mẫu',
      dataIndex: ['sample', 'name'],
      key: 'sampleName',
    },
    {
      title: 'Phí Lấy Mẫu',
      dataIndex: ['sample', 'fee'],
      key: 'sampleFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Kiểu Mẫu',
      dataIndex: ['sample', 'sampleType', 'name'],
      key: 'sampleTypeName',
    },
    {
      title: 'Phí Kiểu Mẫu',
      dataIndex: ['sample', 'sampleType', 'sampleTypeFee'],
      key: 'sampleTypeFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Thời Gian Trả (Ngày)',
      dataIndex: ['timeReturn', 'timeReturn'],
      key: 'timeReturn',
    },
    {
      title: 'Phí Trả Nhanh',
      dataIndex: ['timeReturn', 'timeReturnFee'],
      key: 'timeReturnFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Hành Chính',
      dataIndex: 'isAdministration',
      key: 'isAdministration',
      render: (isAdministration: boolean) =>
        isAdministration ? (
          <Tag color='green'>Có</Tag>
        ) : (
          <Tag color='red'>Không</Tag>
        ),
    },
    {
      title: 'Theo Họ Nội',
      dataIndex: 'isAgnate',
      key: 'isAgnate',
      render: (isAgnate: boolean) =>
        isAgnate ? <Tag color='green'>Có</Tag> : <Tag color='red'>Không</Tag>,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            icon={<EyeOutlined style={{ fontSize: 18 }} />}
            type='default'
            style={{
              backgroundColor: '#e6f4ff',
              borderColor: '#91caff',
              color: '#1677ff',
            }}
            onClick={() => navigate(`/admin/service/${record._id}`)}
          />
          <Button
            icon={<EditOutlined />}
            style={{
              backgroundColor: '#faad14',
              borderColor: '#faad14',
              color: '#fff',
            }}
            onClick={() => navigate(`/admin/service/${record._id}`)}
          />
          <Popconfirm
            title='Xác nhận xóa dịch vụ này?'
            okText='Xóa'
            cancelText='Hủy'
            // onConfirm={() => handleDelete(record._id)}
          >
            <Button
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
              }}
              //   loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {isLoading && (
        <Spin
          size='large'
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
          }}
        />
      )}
      {data && (
        <div
          style={{
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Table
            bordered
            className='service-table'
            size='middle'
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={data.data as Service[]}
            rowKey='_id'
            pagination={false}
          />
          <Pagination
            current={Number(pageNumber)}
            pageSize={Number(pageSize)}
            total={data?.pagination?.totalItems || 0}
            onChange={(page, size) => {
              navigate(`/admin/service?pageNumber=${page}&pageSize=${size}`)
            }}
            showSizeChanger
            showTotal={(total, range) =>
              `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} dịch vụ`
            }
            pageSizeOptions={['5', '10', '20']}
            style={{
              marginTop: '20px',
              textAlign: 'center',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          />
        </div>
      )}
    </div>
  )
}
