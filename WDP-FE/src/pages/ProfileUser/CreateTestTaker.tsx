import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  Typography,
  notification,
  Row,
  Col,
  Divider,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useCreateTestTakerMutation } from '../../features/customer/testTakerApi'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

const { Title } = Typography
const { Option } = Select

export default function CreateTesteeForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [createTestTaker, { isLoading }] = useCreateTestTakerMutation()

  const handleSubmit = async (values: any) => {
    try {
      const token = Cookies.get('userToken')
      const decoded: any = jwtDecode(token)
      const accountId = decoded?.id

      if (!accountId) throw new Error('Không tìm thấy account ID trong token.')

      const genderBoolean =
        values.gender === 'male'
          ? true
          : values.gender === 'female'
            ? false
            : null

      const payload = {
        name: values.name,
        personalId: values.personalId,
        gender: genderBoolean,
        dateOfBirth: values.dayOfBirth.format('YYYY-MM-DD'),
        account: accountId,
      }

      await createTestTaker(payload).unwrap()

      notification.success({
        message: 'Tạo người test thành công',
        description: `${values.name} đã được thêm.`,
      })

      form.resetFields()
      navigate('/profile')
    } catch (error: any) {
      notification.error({
        message: 'Tạo thất bại',
        description:
          error?.data?.message || error?.message || 'Lỗi không xác định',
      })
    }
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <Card
        style={{
          maxWidth: 800,
          margin: 'auto',
          padding: '40px 32px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          🧬 Tạo Hồ Sơ Người Test ADN
        </Title>

        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          autoComplete='off'
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name='name'
                label='Họ và Tên'
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder='Nhập họ tên đầy đủ' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name='personalId'
                label='Số định danh cá nhân'
                rules={[
                  { required: true, message: 'Vui lòng nhập số định danh' },
                  { len: 12, message: 'Số định danh phải đủ 12 chữ số' },
                ]}
              >
                <Input placeholder='012345678901' maxLength={12} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name='gender'
                label='Giới tính'
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder='Chọn giới tính'>
                  <Option value='male'>Nam</Option>
                  <Option value='female'>Nữ</Option>
                  <Option value='other'>Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name='dayOfBirth'
                label='Ngày sinh'
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format='DD/MM/YYYY'
                  disabledDate={(current) => current && current > dayjs()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ textAlign: 'center' }}>
            <Button
              type='primary'
              htmlType='submit'
              style={{
                width: 220,
                height: 45,
                fontSize: 16,
                fontWeight: 500,
              }}
              loading={isLoading}
            >
              ➕ Tạo Người Test
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
