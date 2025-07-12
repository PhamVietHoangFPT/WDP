import { useState } from 'react'
import {
  useGetTimeReturnsQuery,
  useDeleteTimeReturnMutation,
  useCreateTimeReturnMutation,
} from '../../../features/admin/timeReturnAPI'
import {
  Table,
  Spin,
  Button,
  Card,
  Typography,
  Result,
  message,
  Modal, // Import Modal
  Form, // Import Form
  Input,
  InputNumber,
  Popconfirm,
  Space,
} from 'antd'
// ... các import khác cho action buttons

import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [createTimeReturn, { isLoading: isCreating }] =
    useCreateTimeReturnMutation()

  // === Các hàm xử lý ===
  const showModal = () => setIsModalOpen(true)

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields() // Xóa dữ liệu trong form khi đóng
  }

  const handleCreate = async (values) => {
    try {
      await createTimeReturn(values).unwrap()
      message.success('Tạo mới thành công!')
      handleCancel() // Đóng modal và reset form
    } catch (error) {
      message.error('Tạo mới thất bại. Vui lòng thử lại.')
    }
  }
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={3}>Danh sách Thời Gian Trả Mẫu</Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={showModal} // Thay đổi onClick để mở modal
        >
          Tạo mới
        </Button>
      </div>

      <Table
        bordered
        columns={columns}
        dataSource={response} // Lấy dữ liệu từ response.data
        rowKey='_id'
        pagination={false}
      />

      <Modal
        title='Tạo mới Thời Gian Trả Mẫu'
        open={isModalOpen}
        onCancel={handleCancel}
        confirmLoading={isCreating}
        // Dùng footer để các nút có thể tương tác với form
        footer={[
          <Button key='back' onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type='primary'
            loading={isCreating}
            onClick={() => form.submit()}
          >
            Tạo
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' onFinish={handleCreate}>
          <Form.Item
            name='timeReturn'
            label='Thời Gian Trả (Ngày)'
            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name='timeReturnFee'
            label='Phí Trả Nhanh'
            rules={[{ required: true, message: 'Vui lòng nhập phí' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) =>
                value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0
              }
            />
          </Form.Item>
          <Form.Item
            name='description'
            label='Mô tả'
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
