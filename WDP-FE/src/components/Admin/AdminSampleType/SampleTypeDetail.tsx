import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetSampleTypeDetailQuery,
  useUpdateSampleTypeMutation,
} from '../../../features/admin/sampleTypeAPI'
import {
  Card,
  Spin,
  Descriptions,
  Result,
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  message,
} from 'antd'

export default function SampleTypeDetail() {
  const { sampleTypeId } = useParams()
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  // RTK Query hooks cho SampleType
  const {
    data: response,
    isError,
    error,
    isLoading,
  } = useGetSampleTypeDetailQuery(sampleTypeId)
  const [updateSampleType, { isLoading: isUpdating }] =
    useUpdateSampleTypeMutation()

  const sampleTypeData = response?.data?.[0]

  // Điền dữ liệu vào form khi chuyển sang chế độ edit
  useEffect(() => {
    if (isEditing && sampleTypeData) {
      form.setFieldsValue({
        name: sampleTypeData.name,
        sampleTypeFee: sampleTypeData.sampleTypeFee,
      })
    }
  }, [isEditing, sampleTypeData, form])

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

  if (!sampleTypeData) {
    return <Result status='404' title='Không tìm thấy dữ liệu' />
  }

  // Hàm xử lý khi submit form
  const handleFinish = async (values) => {
    try {
      await updateSampleType({ id: sampleTypeId, ...values }).unwrap()
      message.success('Cập nhật thành công!')
      setIsEditing(false)
    } catch (err) {
      message.error('Cập nhật thất bại. Vui lòng thử lại.')
    }
  }

  // Giao diện hiển thị chi tiết
  const DisplayView = (
    <Descriptions bordered column={1}>
      <Descriptions.Item label='ID'>{sampleTypeData._id}</Descriptions.Item>
      <Descriptions.Item label='Tên Loại Mẫu'>
        {sampleTypeData.name}
      </Descriptions.Item>
      <Descriptions.Item label='Phí'>
        {sampleTypeData.sampleTypeFee.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </Descriptions.Item>
    </Descriptions>
  )

  // Giao diện form chỉnh sửa
  const EditView = (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
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
      <Form.Item>
        <Space>
          <Button type='primary' htmlType='submit' loading={isUpdating}>
            Lưu
          </Button>
          <Button onClick={() => setIsEditing(false)}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  )

  return (
    <Card
      title={isEditing ? 'Chỉnh sửa Kiểu Mẫu' : 'Chi tiết Kiểu Mẫu'}
      style={{ margin: '20px' }}
      extra={
        !isEditing && (
          <Button type='primary' onClick={() => setIsEditing(true)}>
            Sửa
          </Button>
        )
      }
    >
      {isEditing ? EditView : DisplayView}
    </Card>
  )
}
