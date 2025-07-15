import {
  useGetAllSamplingKitInventoriesQuery,
  useDeleteSamplingKitInventoryMutation,
  useCreateSamplingKitInventoryMutation,
} from '../../features/samplingKitInventory/samplingKitInventoryAPI'
import Cookies from 'js-cookie'
import { useGetSamplesQuery } from '../../features/admin/sampleAPI'
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
  Tag,
  Pagination,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
} from 'antd'
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useState } from 'react'

const { Title } = Typography
const { Option } = Select
export default function SamplingKitInventoryList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pageNumber = Number(searchParams.get('pageNumber')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10
  const userData = Cookies.get('userData')
  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {}
  const facilityId = parsedUserData?.facility._id
  const {
    data: samplingKitData,
    error: samplingKitError,
    isLoading: samplingKitLoading,
  } = useGetAllSamplingKitInventoriesQuery({
    facilityId: facilityId,
    pageNumber: pageNumber,
    pageSize: pageSize,
  })
  const {
    data: sampleData,
    error: sampleError,
    isLoading: sampleLoading,
  } = useGetSamplesQuery({})
  const [createInventory, { isLoading: isCreating }] =
    useCreateSamplingKitInventoryMutation()

  const showModal = () => setIsModalOpen(true)
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        // Chuyển đổi đối tượng dayjs thành chuỗi ISO string trước khi gửi
        expDate: values.expDate.toISOString(),
      }
      await createInventory(payload).unwrap()
      message.success('Nhập lô kit mới thành công!')
      handleCancel()
    } catch (error) {
      message.error('Tạo mới thất bại.')
    }
  }

  const [deleteInventory, { isLoading: isDeleting }] =
    useDeleteSamplingKitInventoryMutation()

  // 2. Hàm xử lý khi người dùng xác nhận xóa
  const handleDelete = async (id) => {
    try {
      await deleteInventory(id).unwrap()
      message.success('Xóa lô kit thành công!')
    } catch (error) {
      message.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const disabledDate = (current) => {
    // `current` là ngày đang được xét trong lịch
    // So sánh nó với thời điểm đầu ngày hôm nay
    return current && current < dayjs().startOf('day')
  }

  const columns = [
    {
      title: 'Số Lô',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: 'Tên Mẫu Thử',
      dataIndex: ['sample', 'name'], // Truy cập dữ liệu lồng nhau
      key: 'sampleName',
    },
    {
      title: 'Tồn kho / Ban đầu',
      key: 'inventory',
      render: (_: any, record: any) =>
        `${record.inventory} / ${record.kitAmount}`,
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      render: (date: any) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'expDate',
      key: 'expDate',
      render: (date: any) => {
        const isExpired = dayjs(date).isBefore(dayjs())
        return (
          <Tag color={isExpired ? 'red' : 'green'}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Tag>
        )
      },
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size='middle'>
          <Button
            type='link'
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/staff/sampling-kit-inventory/${record._id}`)
            }
          />
          <Popconfirm
            title='Xác nhận xóa lô kit này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type='link'
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]
  if (samplingKitLoading || sampleLoading) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '40px auto' }} />
    )
  }

  if (samplingKitError || sampleError) {
    return <Result status='error' title='Không thể tải dữ liệu' />
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
        <Title level={3}>Quản lý Kho Sample Kit</Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={showModal}>
          Nhập lô mới
        </Button>
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={samplingKitData?.data || []}
        rowKey='_id'
        pagination={false}
      />
      <Pagination
        current={Number(pageNumber)}
        pageSize={Number(pageSize)}
        total={samplingKitData?.pagination?.totalItems || 0}
        onChange={(page, size) => {
          navigate(
            `/staff/sampling-kit-inventory?pageNumber=${page}&pageSize=${size}`
          )
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
      <Modal
        title='Nhập Lô Sample Kit Mới'
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
            name='lotNumber'
            label='Số Lô'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='kitAmount'
            label='Số Lượng'
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name='expDate'
            label='Ngày Hết Hạn'
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder='Chọn ngày hết hạn'
              disabledDate={disabledDate}
            />
          </Form.Item>
          <Form.Item
            name='sample'
            label='Loại Sample Kit'
            rules={[{ required: true }]}
          >
            <Select loading={sampleLoading} placeholder='Chọn loại sample kit'>
              {sampleData?.data?.map((sample) => (
                <Option key={sample._id} value={sample._id}>
                  {sample.name} - (Phí: {sample.fee?.toLocaleString('vi-VN')}{' '}
                  VND)
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
