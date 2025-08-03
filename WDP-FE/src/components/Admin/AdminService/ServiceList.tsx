import { useState } from 'react'
import {
  useGetServiceListQuery,
  useDeleteServiceMutation,
  useCreateServiceMutation,
} from '../../../features/service/serviceAPI'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Pagination,
  Popconfirm,
  Result,
  Space,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'antd'
const { Option } = Select
import type { Service } from '../../../types/service'
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { Spin } from 'antd'
import './AdminService.css'
import { useNavigate } from 'react-router-dom'
import { useGetTimeReturnsQuery } from '../../../features/admin/timeReturnAPI'
import { useGetSamplesQuery } from '../../../features/admin/sampleAPI'
const { Title } = Typography
export default function ServiceList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || 1
  const pageSize = searchParams.get('pageSize') || 10
  const navigate = useNavigate()
  const { data, isLoading } = useGetServiceListQuery({
    pageNumber,
    pageSize,
  })

  const {
    data: timeReturns,
    isLoading: isLoadingTimeReturns,
    isError: isErrorTimeReturns,
    error: errorTimeReturns,
  } = useGetTimeReturnsQuery({})

  const {
    data: samples,
    isLoading: isLoadingSamples,
    isError: isErrorSamples,
    error: errorSamples,
  } = useGetSamplesQuery({})

  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation()
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation()

  // Hàm trợ giúp để định dạng tiền tệ cho gọn
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '-'
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }

  if (isLoading || isLoadingTimeReturns || isLoadingSamples) {
    return (
      <Spin
        size='large'
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px',
        }}
      />
    )
  }

  if (isErrorTimeReturns || isErrorSamples) {
    const errorMessage =
      errorTimeReturns?.message || errorSamples?.message || 'Lỗi tải dữ liệu.'
    const errorStatus = isErrorTimeReturns
      ? errorTimeReturns?.status
      : errorSamples?.status

    const errorTitle = isErrorTimeReturns ? 'Lỗi thời gian trả' : 'Lỗi mẫu thử'

    return (
      <Result status={errorStatus} title={errorTitle} subTitle={errorMessage} />
    )
  }

  const handleDelete = (id: string) => {
    deleteService(id)
  }

  const handleCreate = async (values: any) => {
    try {
      await createService(values).unwrap()
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Error creating service:', error)
    }
  }

  const handleFormChange = (changedValues) => {
    // Trường hợp 1: Nếu 'Tự Lấy Mẫu' thay đổi
    if ('isSelfSampling' in changedValues) {
      // Nếu nó được BẬT
      if (changedValues.isSelfSampling === true) {
        // Tự động TẮT 'Hành Chính'
        form.setFieldsValue({
          isAdministration: false,
        })
      }
    }

    // Trường hợp 2: Nếu 'Hành Chính' thay đổi
    if ('isAdministration' in changedValues) {
      // Nếu nó được BẬT
      if (changedValues.isAdministration === true) {
        // Tự động TẮT 'Tự Lấy Mẫu'
        form.setFieldsValue({
          isSelfSampling: false,
        })
      }
    }
  }

  const CreateServiceModelComponent = () => (
    <Modal
      title='Tạo Dịch Vụ Mới'
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      confirmLoading={isCreating}
      footer={[
        <Button key='back' onClick={() => setIsModalOpen(false)}>
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
      <Form
        form={form}
        layout='vertical'
        onFinish={handleCreate}
        onValuesChange={handleFormChange}
        initialValues={{ isAdministration: false, isAgnate: false }}
      >
        <Form.Item
          name='name'
          label='Tên Dịch Vụ'
          rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
        >
          <Input placeholder='Nhập tên dịch vụ' />
        </Form.Item>
        {/* Sử dụng InputNumber cho các trường số */}
        <Form.Item
          label='Phí Dịch Vụ'
          name='fee'
          rules={[{ required: true, message: 'Vui lòng nhập phí dịch vụ!' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) =>
              value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0
            }
          />
        </Form.Item>

        {/* Sử dụng Select và Option của Antd */}
        <Form.Item
          label='Thời Gian Trả'
          name='timeReturn' // Đổi tên để khớp với body API
          rules={[{ required: true, message: 'Vui lòng chọn thời gian trả!' }]}
        >
          <Select placeholder='Chọn thời gian trả'>
            {timeReturns?.data?.map((tr) => (
              <Option key={tr._id} value={tr._id}>
                {tr.timeReturn} ngày - Phí:{' '}
                {tr.timeReturnFee.toLocaleString('vi-VN')} VND
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label='Mẫu Thử'
          name='sample' // Đổi tên để khớp với body API
          rules={[{ required: true, message: 'Vui lòng chọn mẫu thử!' }]}
        >
          <Select placeholder='Chọn mẫu thử'>
            {samples?.data?.map((sample) => (
              <Option key={sample._id} value={sample._id}>
                {sample.name} - Phí: {sample.fee?.toLocaleString('vi-VN')} VND
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Thêm các trường boolean bằng Switch */}
        <Space>
          <Form.Item
            label='Hành Chính'
            name='isAdministration'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label='Theo Họ Nội'
            name='isAgnate'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label='Tự Lấy Mẫu'
            name='isSelfSampling'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Space>

        {/* ... Nút submit của bạn ... */}
      </Form>
    </Modal>
  )

  const columns = [
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span>{text}</span>,
    },
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
      title: 'Tự Lấy Mẫu',
      dataIndex: 'isSelfSampling',
      key: 'isSelfSampling',
      render: (isSelfSampling: boolean) =>
        isSelfSampling ? (
          <Tag color='green'>Có</Tag>
        ) : (
          <Tag color='red'>Không</Tag>
        ),
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
          <Popconfirm
            title='Xác nhận xóa dịch vụ này?'
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

  const ServiceHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Title level={3}>Danh sách Dịch Vụ</Title>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Tạo mới
      </Button>
    </div>
  )

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
      {data ? (
        <div
          style={{
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <ServiceHeader />
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
              navigate(`/admin/services?pageNumber=${page}&pageSize=${size}`)
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
          <CreateServiceModelComponent />
        </div>
      ) : (
        <>
          <ServiceHeader />
          <CreateServiceModelComponent />
        </>
      )}
    </div>
  )
}
