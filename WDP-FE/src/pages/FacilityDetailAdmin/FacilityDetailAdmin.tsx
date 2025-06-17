import { useEffect, useState } from 'react'
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
import {
  useCreateSlotTemplateMutation,
} from '../../features/admin/slotAPI'

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
const [workingForm] = Form.useForm()
const [showWorkingTimeForm, setShowWorkingTimeForm] = useState(false)

  // Lấy dữ liệu chi tiết cơ sở từ API
  const { data, isLoading } = useGetFacilityDetailQuery(id!)
  // Hook để cập nhật cơ sở
  const [updateFacility] = useUpdateFacilityMutation()
  const [createSlotTemplate] = useCreateSlotTemplateMutation()


  useEffect(() => {
  if (data) {
    form.setFieldsValue({
      facilityName: data.facilityName,
      phoneNumber: data.phoneNumber,
      address: {
        fullAddress: data.address?.fullAddress,
      },
    })

    // If working time exists, set form and show it
    if (data.workTimeStart && data.workTimeEnd && data.slotDuration) {
      workingForm.setFieldsValue({
        workTimeStart: data.workTimeStart,
        workTimeEnd: data.workTimeEnd,
        slotDuration: data.slotDuration,
      })
      setShowWorkingTimeForm(true)
    }
  }
}, [data, form, workingForm])

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


      {showWorkingTimeForm ? (
  <Form
    form={workingForm}
    layout="vertical"
    onFinish={async (values) => {
  try {
    const formatTime = (time: string) => `${time}:00` // Convert HH:mm => HH:mm:ss

    const payload = {
      workTimeStart: formatTime(values.workTimeStart),
      workTimeEnd: formatTime(values.workTimeEnd),
      slotDuration: Number(values.slotDuration),
    }

    console.log("Sending payload:", payload)

    await createSlotTemplate({
      id,
      data: payload,
    }).unwrap()

    message.success('Cập nhật giờ làm việc thành công!')
  } catch (err: any) {
    message.error(err.message || 'Lỗi khi cập nhật giờ làm việc!')
  }
}}


    style={{ marginTop: 40 }}
  >
    <Title level={4}>Cập nhật giờ làm việc</Title>

    <Form.Item
      label="Giờ bắt đầu"
      name="workTimeStart"
      rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
    >
      <Input type="time" />
    </Form.Item>

    <Form.Item
      label="Giờ kết thúc"
      name="workTimeEnd"
      rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
    >
      <Input type="time" />
    </Form.Item>

    <Form.Item
      label="Thời lượng mỗi slot (giờ)"
      name="slotDuration"
      rules={[{ required: true, message: 'Nhập thời lượng slot' }]}
    >
      <Input type="number" step="0.5" min={0.5} />
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit">Lưu giờ làm việc</Button>
    </Form.Item>
  </Form>
) : (
  <Button
    type="dashed"
    style={{ marginTop: 40 }}
    onClick={() => setShowWorkingTimeForm(true)}
  >
    Thêm giờ làm việc
  </Button>
)}

    </div>
  )
}

export default FacilityDetailAdmin