import React from 'react'
import {
  useGetTimeReturnsQuery,
  useDeleteTimeReturnMutation,
} from '../../../features/admin/timeReturnAPI'
import {
  Table,
  Spin,
  Button,
  Space,
  Popconfirm,
  Card,
  Typography,
  Result,
  message,
} from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

export default function TimeReturnList() {
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetTimeReturnsQuery({})
  const [deleteTimeReturn, { isLoading: isDeleting }] =
    useDeleteTimeReturnMutation()
  const navigate = useNavigate()

  const handleDelete = async (id) => {
    try {
      await deleteTimeReturn(id).unwrap()
      message.success('Xóa thành công!')
    } catch (error: object) {
      message.error(`Xóa thất bại: ${error.data?.message || 'Có lỗi xảy ra'}`)
    }
  }

  interface TimeReturnRecord {
    _id: string
    timeReturn: string
    timeReturnFee: number
    description: string
  }

  const columns: ColumnsType<TimeReturnRecord> = [
    {
      title: 'Thời Gian Trả (Ngày)',
      dataIndex: 'timeReturn',
      key: 'timeReturn',
      align: 'center' as const,
    },
    {
      title: 'Phí Trả Nhanh',
      dataIndex: 'timeReturnFee',
      key: 'timeReturnFee',
      align: 'right' as const,
      render: (fee: number) =>
        fee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Hành Động',
      key: 'actions',
      align: 'center' as const,
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
            onClick={() => navigate(`/admin/time-returns/${record._id}`)}
          />
          <Popconfirm
            title='Xác nhận xóa?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
              }}
              loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (isLoading) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '40px auto' }} />
    )
  }

  if (isError) {
    const errorMessage = error?.data?.message || 'Có lỗi xảy ra'
    const errorStatus = error?.status || 'Lỗi'

    return (
      <Result
        status={errorStatus === 404 ? '404' : 'error'}
        title={errorStatus}
        subTitle={errorMessage}
        style={{ marginTop: '20px' }}
      />
    )
  }

  return (
    <Card>
      <Title level={3}>Danh sách Thời Gian Trả Mẫu</Title>
      <Table
        bordered
        columns={columns}
        dataSource={response} // Lấy dữ liệu từ response.data
        rowKey='_id'
        pagination={false}
      />
    </Card>
  )
}
