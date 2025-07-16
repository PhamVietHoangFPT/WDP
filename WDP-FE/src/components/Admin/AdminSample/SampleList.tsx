import {
  useGetSamplesQuery,
  useDeleteSampleMutation,
  useCreateSampleMutation,
} from '../../../features/admin/sampleAPI'
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
  notification,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from 'antd'
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const { Title } = Typography

const { Option } = Select
export default function SampleList() {
  const { data: response, isLoading, isError, error } = useGetSamplesQuery({})
  const [deleteSample, { isLoading: isDeleting }] = useDeleteSampleMutation()
  const [createSample, { isLoading: isCreating }] = useCreateSampleMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const handleDelete = async (id) => {
    try {
      await deleteSample(id).unwrap()
      message.success('Xóa mẫu thử thành công!')
    } catch (error) {
      message.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const showModal = () => {
    setIsModalOpen(true)
    form.resetFields()
  }

  const handleCreate = async ({ name, fee }) => {
    try {
      const newSample = await createSample({
        name,
        fee,
      }).unwrap()
      notification.success({
        message: 'Tạo mẫu thử thành công!',
        description: `Mẫu thử "${newSample.name}" đã được tạo.`,
      })
      navigate(`/admin/samples/${newSample._id}`)
    } catch (error) {
      notification.error({
        message: 'Tạo mẫu thử thất bại.',
        description: 'Vui lòng thử lại.',
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const columns = [
    {
      title: 'Tên Mẫu Thử',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phí',
      dataIndex: 'fee',
      key: 'fee',
      render: (text) => (
        <span>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(text)}
        </span>
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='link'
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/samples/${record._id}`)}
            style={{
              backgroundColor: '#e6f4ff',
              borderColor: '#91caff',
              color: '#1677ff',
            }}
          />
          <Popconfirm
            title='Xác nhận xóa mẫu thử này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type='link'
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
              }}
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

  const ModalComponent = () => (
    <Modal
      title='Chỉnh sửa Loại Mẫu Thử'
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
          Lưu
        </Button>,
      ]}
    >
      <Form form={form} layout='vertical' onFinish={handleCreate}>
        <Form.Item
          name='name'
          label='Tên Loại Mẫu Thử'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name='fee' label='Phí' rules={[{ required: true }]}>
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
  )

  const SampleHeaderComponent = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <Title level={3}>Danh sách các Loại Mẫu Thử</Title>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={showModal} // Thay đổi onClick để mở modal
      >
        Tạo mới
      </Button>
    </div>
  )

  if (isError) {
    const errorMessage = error?.message || 'Có lỗi xảy ra'
    const errorStatus = error?.status || 'Lỗi'

    return (
      <>
        <SampleHeaderComponent />
        <Result
          status={errorStatus === 404 ? '404' : 'error'}
          title={errorStatus}
          subTitle={errorMessage}
          style={{ marginTop: '20px' }}
        />
        <ModalComponent />
      </>
    )
  }

  return (
    <Card>
      <SampleHeaderComponent />
      <Table
        bordered
        columns={columns}
        dataSource={response?.data || []}
        rowKey='_id'
        pagination={false}
      />
      <ModalComponent />
    </Card>
  )
}
