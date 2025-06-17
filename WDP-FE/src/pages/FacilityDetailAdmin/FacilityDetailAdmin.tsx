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

// Định nghĩa Interface cho Facility
// Export lại để đảm bảo mọi nơi đều dùng đúng
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

  // Lấy dữ liệu chi tiết cơ sở từ API
  const { data, isLoading } = useGetFacilityDetailQuery(id!)
  // Hook để cập nhật cơ sở
  const [updateFacility] = useUpdateFacilityMutation()


  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        facilityName: data.facilityName,
        phoneNumber: data.phoneNumber,
        address: {
          fullAddress: data.address?.fullAddress,
        },
      })
    }
  }, [data, form]) // Dependencies bao gồm data và form instance

  // Hàm xử lý khi submit form
  const handleSave = async (values: any) => {
    try {
      // Log values để kiểm tra dữ liệu trước khi gửi
      console.log("Values từ form Ant Design:", values);

      const formData = new FormData()
      formData.append('facilityName', values.facilityName)
      formData.append('phoneNumber', values.phoneNumber)
      formData.append('fullAddress', values.address.fullAddress)

      // Gửi yêu cầu cập nhật lên API
      await updateFacility({ id, data: formData }).unwrap()
      message.success('Cập nhật cơ sở thành công!')
      navigate('/admin/facility') 
    } catch (err: any) {
      // Xử lý lỗi từ API
      message.error(err.message || 'Đã có lỗi xảy ra khi cập nhật!')
      console.error("Lỗi khi cập nhật:", err);
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
        form={form} // Gán instance của form
        layout="vertical"
        onFinish={handleSave} // Xử lý khi form được submit
      >
        <Form.Item
          label="Tên cơ sở"
          name="facilityName" // Tên trường trực tiếp
          rules={[{ required: true, message: 'Nhập tên cơ sở' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber" // Tên trường trực tiếp
          rules={[{ required: true, message: 'Nhập số điện thoại' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ đầy đủ"
          name={['address', 'fullAddress']} // Ant Design sẽ tự động tạo cấu trúc { address: { fullAddress: value } }
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