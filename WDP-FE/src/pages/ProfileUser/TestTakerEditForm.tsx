// src/pages/TestTakerEditForm.tsx
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  Typography,
  message,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import dayjs from 'dayjs'
import {
  useCreateTestTakerMutation,
  useGetTestTakerByIdQuery,
} from '../../features/customer/testTakerApi'
import HeaderCus from '../../components/layout/Header/HeaderCus'

const { Title } = Typography
const { Option } = Select

export default function TestTakerEditForm() {
  const [form] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useGetTestTakerByIdQuery(id || '')
  const [updateTestTaker] = useCreateTestTakerMutation() // reuse POST (tuỳ logic backend)

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data.name,
        personalId: data.personalId,
        gender: data.gender ? 'male' : 'female',
        dateOfBirth: dayjs(data.dateOfBirth),
      })
    }
  }, [data])

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        gender: values.gender === 'male',
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      }

      await updateTestTaker({ ...payload, id }) // tuỳ backend là POST hay PUT
      message.success('Cập nhật thành công!')
      navigate('/test-takers')
    } catch (err) {
      message.error('Cập nhật thất bại.')
    }
  }

  return (
    <div>
      <Card style={{ maxWidth: 600, margin: '40px auto' }}>
        <Title level={3}>Chỉnh sửa Người Test ADN</Title>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            name='name'
            label='Họ và Tên'
            rules={[{ required: true, message: 'Nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='personalId'
            label='Số định danh'
            rules={[
              { required: true, message: 'Nhập số định danh' },
              { len: 12, message: 'Phải đủ 12 số' },
            ]}
          >
            <Input maxLength={12} />
          </Form.Item>

          <Form.Item
            name='gender'
            label='Giới tính'
            rules={[{ required: true, message: 'Chọn giới tính' }]}
          >
            <Select>
              <Option value='male'>Nam</Option>
              <Option value='female'>Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name='dateOfBirth'
            label='Ngày sinh'
            rules={[{ required: true, message: 'Chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
          </Form.Item>

          <Form.Item style={{ textAlign: 'center' }}>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
