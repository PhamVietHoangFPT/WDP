import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetSampleDetailQuery,
  useUpdateSampleMutation,
} from '../../../features/admin/sampleAPI'
import { useGetSampleTypesQuery } from '../../../features/admin/sampleTypeAPI'
import {
  Card,
  Descriptions,
  Button,
  Spin,
  Result,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd'
import { EditOutlined } from '@ant-design/icons'

const { Option } = Select

export default function SampleDetail() {
  const { sampleId } = useParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  // API hooks
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetSampleDetailQuery(sampleId)
  const { data: sampleTypes, isLoading: isLoadingTypes } =
    useGetSampleTypesQuery({})
  const [updateSample, { isLoading: isUpdating }] = useUpdateSampleMutation()

  const sampleData = response

  // Hàm mở modal và điền sẵn dữ liệu
  const showModal = () => {
    form.setFieldsValue({
      name: sampleData.name,
      fee: sampleData.fee,
      sampleType: sampleData.sampleType._id, // Chỉ điền ID của sampleType
    })
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // Hàm xử lý khi submit form
  const handleUpdate = async (values) => {
    try {
      await updateSample({ id: sampleId, ...values }).unwrap()
      message.success('Cập nhật thành công!')
      setIsModalOpen(false)
    } catch (err) {
      message.error('Cập nhật thất bại.')
    }
  }

  // Xử lý các trạng thái của trang
  if (isLoading)
    return (
      <Spin size='large' style={{ display: 'block', margin: '40px auto' }} />
    )
  if (isError)
    return (
      <Result
        status='error'
        title='Lỗi tải dữ liệu'
        subTitle={error?.data?.message}
      />
    )
  if (!sampleData)
    return (
      <Result status='404' title='404' subTitle='Không tìm thấy mẫu thử.' />
    )

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title='Chi tiết Mẫu Thử'
        extra={
          <Button type='primary' icon={<EditOutlined />} onClick={showModal}>
            Sửa
          </Button>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label='ID'>{sampleData._id}</Descriptions.Item>
          <Descriptions.Item label='Tên Mẫu Thử'>
            {sampleData.name}
          </Descriptions.Item>
          <Descriptions.Item label='Phí'>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(sampleData.fee)}
          </Descriptions.Item>
          <Descriptions.Item label='Kiểu Mẫu'>
            {sampleData.sampleType.name}
          </Descriptions.Item>
          <Descriptions.Item label='Phí Kiểu Mẫu'>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(sampleData.sampleType.sampleTypeFee)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modal Chỉnh Sửa */}
      <Modal
        title='Chỉnh sửa Mẫu Thử'
        open={isModalOpen}
        onCancel={handleCancel}
        confirmLoading={isUpdating}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type='primary'
            loading={isUpdating}
            onClick={() => form.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' onFinish={handleUpdate}>
          <Form.Item
            name='name'
            label='Tên Mẫu Thử'
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
          <Form.Item
            name='sampleType'
            label='Kiểu Mẫu'
            rules={[{ required: true }]}
          >
            <Select loading={isLoadingTypes} placeholder='Chọn một kiểu mẫu'>
              {sampleTypes?.data?.map((type) => (
                <Option key={type._id} value={type._id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
