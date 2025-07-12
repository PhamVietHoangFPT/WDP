import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  useGetTimeReturnDetailQuery,
  useUpdateTimeReturnMutation,
} from '../../../features/admin/timeReturnAPI'
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

export default function TimeReturnDetail() {
  const { timeReturnId } = useParams()
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  // RTK Query hooks
  const {
    data: response,
    isError,
    error,
    isLoading,
  } = useGetTimeReturnDetailQuery(timeReturnId)
  const [updateTimeReturn, { isLoading: isUpdating }] =
    useUpdateTimeReturnMutation()

  const timeReturnData = response?.data?.[0]

  // Điền dữ liệu vào form khi chuyển sang chế độ edit
  useEffect(() => {
    if (isEditing && timeReturnData) {
      form.setFieldsValue({
        timeReturn: timeReturnData.timeReturn,
        timeReturnFee: timeReturnData.timeReturnFee,
        description: timeReturnData.description,
      })
    }
  }, [isEditing, timeReturnData, form])

  if (isLoading) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '40px auto' }} />
    )
  }

  if (!timeReturnData) {
    return <Result status='404' title='Không tìm thấy dữ liệu' />
  }

  // Hàm xử lý khi submit form
  const handleFinish = async (values) => {
    try {
      await updateTimeReturn({ id: timeReturnId, ...values }).unwrap()
      message.success('Cập nhật thành công!')
      setIsEditing(false) // Chuyển về chế độ xem
    } catch (err) {
      message.error('Cập nhật thất bại. Vui lòng thử lại.')
    }
  }

  // 2. Xử lý trạng thái Lỗi
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

  // Xử lý trường hợp không tìm thấy dữ liệu
  if (!timeReturnData) {
    return <Result status='404' title='Không tìm thấy dữ liệu' />
  }

  const DisplayView = (
    <Descriptions bordered column={1}>
      <Descriptions.Item label='ID'>{timeReturnData._id}</Descriptions.Item>
      <Descriptions.Item label='Thời Gian Trả (Ngày)'>
        {timeReturnData.timeReturn}
      </Descriptions.Item>
      <Descriptions.Item label='Phí Trả Nhanh'>
        {timeReturnData.timeReturnFee.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </Descriptions.Item>
      <Descriptions.Item label='Mô tả'>
        {timeReturnData.description}
      </Descriptions.Item>
    </Descriptions>
  )

  // Giao diện form chỉnh sửa
  const EditView = (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
      <Form.Item
        name='timeReturn'
        label='Thời Gian Trả (Ngày)'
        rules={[{ required: true, message: 'Vui lòng nhập thời gian trả' }]}
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
      <Form.Item name='description' label='Mô tả'>
        <Input.TextArea rows={4} />
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
      title={
        isEditing ? 'Chỉnh sửa Thời Gian Trả Mẫu' : 'Chi tiết Thời Gian Trả Mẫu'
      }
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
