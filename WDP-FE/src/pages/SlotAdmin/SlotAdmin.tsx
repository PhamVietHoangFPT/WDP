import { useNavigate } from 'react-router-dom'
import {
  Form,
  InputNumber,
  DatePicker,
  Button,
  Typography,
  message,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useCreateSlotsMutation } from '../../features/admin/slotAPI' // adjust path as needed
import { useState } from 'react'

const { Title } = Typography

const CreateSlot: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [createSlots] = useCreateSlotsMutation()

  const [loading, setLoading] = useState(false)

  const handleSave = async (values: {
    daysToGenerate: number
    startDate: Dayjs
  }) => {
    const { daysToGenerate, startDate } = values

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('daysToGenerate', daysToGenerate.toString())
      formData.append('startDate', dayjs(startDate).format('YYYY-MM-DD'))

      const response = (await createSlots(formData).unwrap()) as {
        message: string
      }
      message.success(response.message || 'Tạo slot thành công')
      // navigate('/admin/slots')
    } catch (error: any) {
      message.error(error.message || 'Đã xảy ra lỗi khi tạo slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tạo Slot</Title>
      <Form form={form} layout='vertical' onFinish={handleSave}>
        <Form.Item
          label='Số ngày cần tạo'
          name='daysToGenerate'
          rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}
        >
          <InputNumber min={1} max={30} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label='Ngày bắt đầu'
          name='startDate'
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button type='primary' htmlType='submit' loading={loading}>
              Tạo
            </Button>
            <Button onClick={() => navigate('/admin/slots')}>Trở lại</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateSlot
