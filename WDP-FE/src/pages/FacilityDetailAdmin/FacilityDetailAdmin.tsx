import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Typography, message, Spin, Select } from 'antd'
import {
  useGetFacilityDetailQuery,
  useUpdateFacilityMutation,
} from '../../features/admin/facilitiesAPI'
import {
  useCreateSlotTemplateMutation,
  useGetSlotTemplateForFacilityQuery,
} from '../../features/admin/slotAPI'
import {
  useGetDistrictListQuery,
  useGetProvinceListQuery,
  useGetWardListQuery,
} from '../../features/location/location'
import type { District, Province, Ward } from '../../types/location'

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

interface SlotTemplate {
  workTimeStart: string
  workTimeEnd: string
  slotDuration: number
  facility: string
}

const { Title } = Typography
const { Option } = Select

const FacilityDetailAdmin: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [workingForm] = Form.useForm()
  const [showWorkingTimeForm, setShowWorkingTimeForm] = useState(false)
  const [showUpdateAddressForm, setShowUpdateAddressForm] = useState(false)
  // Lấy dữ liệu chi tiết cơ sở từ API
  const { data, isLoading } = useGetFacilityDetailQuery(id!)
  const { data: slotTemplate, isLoading: isLoadingForSlotTemplate } =
    useGetSlotTemplateForFacilityQuery(id!)
  // Hook để cập nhật cơ sở
  const [updateFacility] = useUpdateFacilityMutation()
  const [createSlotTemplate] = useCreateSlotTemplateMutation()
  // State for cascading dropdowns
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  )
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  )
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)

  // API queries - Remove generic types and access data directly
  const { data: provincesData, isLoading: provincesLoading } =
    useGetProvinceListQuery({})

  const { data: districtsData, isLoading: districtsLoading } =
    useGetDistrictListQuery(
      {
        province_code: selectedProvince?.code,
      },
      {
        skip: !selectedProvince?.code,
      }
    )

  const { data: wardsData, isLoading: wardsLoading } = useGetWardListQuery(
    {
      district_code: selectedDistrict?.code,
    },
    {
      skip: !selectedDistrict?.code,
    }
  )

  const houseNumberValue = Form.useWatch('houseNumber')

  const handleProvinceChange = (value: number) => {
    const province = provincesData?.find((p: Province) => p.code === value)
    setSelectedProvince(province || null)
    setSelectedDistrict(null)
    setSelectedWard(null)
    form.setFieldsValue({ district: undefined, ward: undefined })
  }

  const handleDistrictChange = (value: number) => {
    const district = districtsData?.find((d: District) => d.code === value)
    setSelectedDistrict(district || null)
    setSelectedWard(null)
    form.setFieldsValue({ ward: undefined })
  }

  const handleWardChange = (value: number) => {
    const ward = wardsData?.find((w: Ward) => w.code === value)
    setSelectedWard(ward || null)
  }

  useEffect(() => {
    if (data) {
      console.log(data)
      form.setFieldsValue({
        facilityName: data.facilityName,
        phoneNumber: data.phoneNumber,
        address: {
          fullAddress: data.address?.fullAddress,
        },
      })
    }

    if (slotTemplate?.data?.length > 0) {
      const slot = slotTemplate.data[0]

      if (slot.workTimeStart && slot.workTimeEnd && slot.slotDuration) {
        workingForm.setFieldsValue({
          workTimeStart: slot.workTimeStart.slice(0, 5), // convert HH:mm:ss → HH:mm
          workTimeEnd: slot.workTimeEnd.slice(0, 5),
          slotDuration: slot.slotDuration,
        })
        setShowWorkingTimeForm(true)
      }
    } else {
      // Không có slot template
      setShowWorkingTimeForm(false)
    }
  }, [data, slotTemplate, form, workingForm])

  // Hàm xử lý khi submit form
  const handleSave = async (values: any) => {
    try {
      // Log values để kiểm tra dữ liệu trước khi gửi
      console.log('Values từ form Ant Design:', values)

      const formData = new FormData()
      formData.append('facilityName', values.facilityName)
      formData.append('phoneNumber', values.phoneNumber)
      formData.append('address', values.address._id)

      // Gửi yêu cầu cập nhật lên API
      await updateFacility({ id, data: formData }).unwrap()
      message.success('Cập nhật cơ sở thành công!')
      navigate('/admin/facility')
    } catch (err: any) {
      // Xử lý lỗi từ API
      message.error(err.message || 'Đã có lỗi xảy ra khi cập nhật!')
      console.error('Lỗi khi cập nhật:', err)
    }
  }

  if (isLoading) {
    return <Spin style={{ marginTop: 60 }} size='large' />
  }

  if (!data) return <div>Không tìm thấy thông tin cơ sở</div>

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Cập nhật thông tin cơ sở</Title>
      <Form
        form={form} // Gán instance của form
        layout='vertical'
        onFinish={handleSave} // Xử lý khi form được submit
      >
        <Form.Item
          label='Tên cơ sở'
          name='facilityName' // Tên trường trực tiếp
          rules={[{ required: true, message: 'Nhập tên cơ sở' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='Số điện thoại'
          name='phoneNumber' // Tên trường trực tiếp
          rules={[{ required: true, message: 'Nhập số điện thoại' }]}
        >
          <Input />
        </Form.Item>

        {!showUpdateAddressForm && (
          <Form.Item
            label='Địa chỉ đầy đủ'
            name={['address', 'fullAddress']} // Ant Design sẽ tự động tạo cấu trúc { address: { fullAddress: value } }
            rules={[{ required: true, message: 'Nhập địa chỉ' }]}
          >
            <Input disabled />
          </Form.Item>
        )}

        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Lưu
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate('/admin/facility')}
          >
            Trở lại
          </Button>
        </Form.Item>
      </Form>
      <Button
        type='primary'
        onClick={() => setShowUpdateAddressForm(!showUpdateAddressForm)}
        style={{ marginTop: 20 }}
      >
        {showUpdateAddressForm ? 'Đóng cập nhật địa chỉ' : 'Cập nhật địa chỉ'}
      </Button>
      {showUpdateAddressForm && (
        <div>
          <Title level={3}>Cập nhật địa chỉ</Title>
          <Form
            layout='vertical'
            style={{ marginTop: 20 }}
            onFinish={() => setShowUpdateAddressForm(true)}
          >
            <Form.Item label='Tỉnh/Thành phố'>
              <Select
                placeholder='Chọn tỉnh/thành phố'
                value={selectedProvince?.code}
                onChange={handleProvinceChange}
                loading={provincesLoading}
              >
                {provincesData?.map((province: Province) => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label='Quận/Huyện'>
              <Select
                placeholder='Chọn quận/huyện'
                value={selectedDistrict?.code}
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                loading={districtsLoading}
              >
                {districtsData?.map((district: District) => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label='Phường/Xã'>
              <Select
                placeholder='Chọn phường/xã'
                value={selectedWard?.code}
                onChange={handleWardChange}
                disabled={!selectedDistrict}
                loading={wardsLoading}
              >
                {wardsData?.map((ward: Ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label='Số nhà, tên đường'
              name='houseNumber'
              rules={[{ required: true, message: 'Nhập địa chỉ chi tiết' }]}
            >
              <Input placeholder='Địa chỉ chi tiết (số nhà, tên đường...)' />
            </Form.Item>

            {selectedProvince && selectedDistrict && selectedWard && (
              <Form.Item label='Địa chỉ đầy đủ'>
                <Input
                  // 2. Sử dụng biến đã theo dõi ở đây
                  value={`${houseNumberValue || ''}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`.trim()}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Item>
            )}

            <Button type='primary' htmlType='submit'>
              Lưu
            </Button>
          </Form>
        </div>
      )}

      {showWorkingTimeForm ? (
        <Form
          form={workingForm}
          layout='vertical'
          onFinish={async (values) => {
            try {
              const formatTime = (time: string) => `${time}:00` // Convert HH:mm => HH:mm:ss

              const payload = {
                workTimeStart: formatTime(values.workTimeStart),
                workTimeEnd: formatTime(values.workTimeEnd),
                slotDuration: Number(values.slotDuration),
                facility: id,
              }

              console.log('Sending payload:', payload)

              await createSlotTemplate({
                workTimeStart: formatTime(values.workTimeStart),
                workTimeEnd: formatTime(values.workTimeEnd),
                slotDuration: Number(values.slotDuration),
                facility: id,
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
            label='Giờ bắt đầu'
            name='workTimeStart'
            rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
          >
            <Input type='time' />
          </Form.Item>

          <Form.Item
            label='Giờ kết thúc'
            name='workTimeEnd'
            rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
          >
            <Input type='time' />
          </Form.Item>

          <Form.Item
            label='Thời lượng mỗi slot (giờ)'
            name='slotDuration'
            rules={[{ required: true, message: 'Nhập thời lượng slot' }]}
          >
            <Input type='number' step='0.5' min={0.5} />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Lưu giờ làm việc
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Button
          type='dashed'
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
