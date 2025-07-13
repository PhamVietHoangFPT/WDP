import { useState } from 'react'
import {
  useGetSampleTypesQuery,
  useDeleteSampleTypeMutation,
  useCreateSampleTypeMutation, // Import hook tạo mới
} from '../../../features/admin/sampleTypeAPI'
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
  Modal, // Import Modal
  Form, // Import Form
  Input,
  InputNumber,
} from 'antd'
const { Title } = Typography
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'

interface SampleType {
  _id: string
  name: string
  sampleTypeFee: number
}

export default function SampleTypeList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: response, isLoading, isError } = useGetSampleTypesQuery({})
  const [deleteSampleType, { isLoading: isDeleting }] =
    useDeleteSampleTypeMutation()
  const [createSampleType, { isLoading: isCreating }] =
    useCreateSampleTypeMutation()

  const navigate = useNavigate()

  // === Các hàm xử lý ===
  const showModal = () => setIsModalOpen(true)

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleCreate = async (values) => {
    try {
      await createSampleType(values).unwrap()
      message.success('Tạo kiểu mẫu thành công!')
      handleCancel()
    } catch (error) {
      message.error('Tạo thất bại. Vui lòng thử lại.')
    }
  }

  // 2. Hàm xử lý khi người dùng xác nhận xóa
  const handleDelete = async (id) => {
    try {
      await deleteSampleType(id).unwrap()
      message.success('Xóa loại mẫu thành công!')
    } catch (error) {
      message.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const columns: ColumnsType<SampleType> = [
    {
      title: 'Tên loại mẫu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phí',
      dataIndex: 'sampleTypeFee',
      key: 'sampleTypeFee',
      align: 'right',
      render: (fee: number) =>
        fee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      align: 'center',
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
            // Sửa đường dẫn để đúng với sample-types
            onClick={() => navigate(`/admin/sample-types/${record._id}`)}
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
        <Title level={3}>Danh sách Kiểu Mẫu Xét Nghiệm</Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={showModal} // Mở modal
        >
          Tạo mới
        </Button>
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={response?.data || []}
        rowKey='_id'
        pagination={{ pageSize: 10, total: response?.total }}
      />

      {/* === Modal và Form tạo mới === */}
      <Modal
        title='Tạo mới Kiểu Mẫu'
        open={isModalOpen}
        onCancel={handleCancel}
        confirmLoading={isCreating}
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
            name='name'
            label='Tên Loại Mẫu'
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='sampleTypeFee'
            label='Phí'
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
        </Form>
      </Modal>
    </Card>
  )
}
