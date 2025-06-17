import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Spin,
} from 'antd'
import {
  useGetFacilityDetailQuery,
  useUpdateFacilityMutation,
} from '../../features/admin/facilitiesAPI'

export interface Facility {
  _id: string
  facilityName: string
  address: {
    fullAddress: string
  }
  phoneNumber: string | null
}

const { Title } = Typography

const FacilityDetailAdmin: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const { data, isLoading } = useGetFacilityDetailQuery(id!)
  const [updateFacility] = useUpdateFacilityMutation()

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({
        facilityName: data.data.facilityName,
        phoneNumber: data.data.phoneNumber,
        fullAddress: data.data.address?.fullAddress,
      })
    }
  }, [data, form])

  const handleSave = async (values: any) => {
    try {
      const formData = new FormData()
      formData.append('facilityName', values.facilityName)
      formData.append('phoneNumber', values.phoneNumber)
      formData.append('fullAddress', values.fullAddress)

      await updateFacility({ id, data: formData }).unwrap()
      message.success('Cập nhật cơ sở thành công!')
      navigate('/admin/facilities')
    } catch (err: any) {
      message.error(err.message || 'Đã có lỗi xảy ra!')
    }
  }

  if (isLoading) {
    return <Spin style={{ marginTop: 60 }} size="large" />
  }

  if (!data) return <div>Không tìm thấy thông tin cơ sở</div>

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Cập nhật thông tin cơ sở</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        <Form.Item
          label="Tên cơ sở"
          name="facilityName"
          rules={[{ required: true, message: 'Nhập tên cơ sở' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: 'Nhập số điện thoại' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ đầy đủ"
          name="fullAddress"
          rules={[{ required: true, message: 'Nhập địa chỉ' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Lưu</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/facilities')}>Trở lại</Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FacilityDetailAdmin
