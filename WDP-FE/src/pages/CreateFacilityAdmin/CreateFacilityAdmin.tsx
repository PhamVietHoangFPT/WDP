'use client'

import type React from 'react'
import { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Select,
  AutoComplete,
  Spin,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  useGetProvinceListQuery,
  useGetWardListQuery,
  useCreateFacilityAddressMutation,
} from '../../features/location/location'
import { useCreateFacilityMutation } from '../../features/admin/facilitiesAPI'

const { Title } = Typography

interface Province {
  _id: string
  Code: string
  FullName: string
}

interface Ward {
  Code: string
  FullName: string
  ProvinceCode: string
}

interface FacilityInfo {
  facilityName: string
  phoneNumber: string
  address: string
}

const CreateFacilityForm: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [provinceOptions, setProvinceOptions] = useState([])
  const [wardOptions, setWardOptions] = useState([])
  // State for cascading dropdowns
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  )
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [houseNumberValue, setHouseNumberValue] = useState<string>('')

  // API queries
  const { data: provincesData, isLoading: provincesLoading } =
    useGetProvinceListQuery({
      pageNumber: 1,
      pageSize: 100,
    })

  const { data: wardsData, isLoading: wardsLoading } = useGetWardListQuery(
    {
      pageNumber: 1,
      pageSize: 1000,
      province_code: selectedProvince?.Code,
    },
    {
      skip: !selectedProvince?.Code,
    }
  )

  const [createFacilityAddress] = useCreateFacilityAddressMutation()
  const [createFacility] = useCreateFacilityMutation()

  const handleProvinceSearch = (searchText: string) => {
    if (!searchText) {
      setProvinceOptions([])
      return
    }
    const filtered = provincesData
      ?.filter((province: Province) =>
        province.FullName.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((province: Province) => ({
        value: province.FullName, // QUAN TRỌNG: value phải là FullName
        label: province.FullName,
        object: province, // Đính kèm cả object để dùng sau
      }))
    setProvinceOptions(filtered || [])
  }

  // Thay thế hàm handleWardSearch của bạn bằng hàm này
  const handleWardSearch = (searchText: string) => {
    if (!searchText) {
      setWardOptions([])
      return
    }
    const filtered = wardsData
      ?.filter((ward: Ward) =>
        ward.FullName.toLowerCase().includes(searchText.toLowerCase())
      )
      .map((ward: Ward) => ({
        value: ward.FullName, // QUAN TRỌNG: value phải là FullName
        label: ward.FullName,
        object: ward, // Đính kèm cả object để dùng sau
      }))
    setWardOptions(filtered || [])
  }
  // Thay thế hàm handleProvinceChange của bạn bằng hàm này
  const handleProvinceChange = (
    value: string,
    option?: { object: Province } | { object: Province }[] | undefined
  ) => {
    // Nếu option là mảng, lấy phần tử đầu tiên
    let selectedOption: { object: Province } | undefined
    if (Array.isArray(option)) {
      selectedOption = option[0]
    } else {
      selectedOption = option
    }

    if (selectedOption) {
      setSelectedProvince(selectedOption.object)
      setSelectedWard(null)
      form.setFieldsValue({ ward: undefined }) // Reset giá trị trong Form
    } else {
      setSelectedProvince(null)
      setSelectedWard(null)
      form.setFieldsValue({ ward: undefined })
    }
  }

  // Thay thế hàm handleWardChange của bạn bằng hàm này
  const handleWardChange = (
    value: string,
    option?: { object: Ward } | { object: Ward }[] | undefined
  ) => {
    let selectedOption: { object: Ward } | undefined
    if (Array.isArray(option)) {
      selectedOption = option[0]
    } else {
      selectedOption = option
    }
    if (selectedOption) {
      setSelectedWard(selectedOption.object)
    } else {
      setSelectedWard(null)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (!selectedProvince || !selectedWard) {
        message.error('Vui lòng chọn đầy đủ thông tin địa chỉ')
        return
      }

      const fullAddress =
        `${values.houseNumber || ''}, ${selectedWard.FullName}, ${selectedProvince.FullName}`.trim()

      // Step 1: Create address
      const addressResponse = await createFacilityAddress({
        data: { fullAddress },
      }).unwrap()

      const addressId = addressResponse._id
      console.log('Address created:', addressResponse)

      // Step 2: Create facility with address ID
      const facilityData: FacilityInfo = {
        facilityName: values.facilityName,
        phoneNumber: values.phoneNumber,
        address: addressId,
      }

      console.log('Creating facility with:', facilityData)

      const facilityResponse = (await createFacility({
        data: facilityData,
      }).unwrap()) as { message: string }

      message.success(facilityResponse.message || 'Tạo cơ sở thành công!')
      form.resetFields()
      setSelectedProvince(null)
      setSelectedWard(null)
      setHouseNumberValue('')
      navigate('/admin/createFacility')
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra khi tạo cơ sở')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Title level={2}>Tạo Cơ Sở Mới</Title>

      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        style={{ marginTop: '24px' }}
      >
        {/* Facility Name */}
        <Form.Item
          label='Tên cơ sở'
          name='facilityName'
          rules={[{ required: true, message: 'Vui lòng nhập tên cơ sở' }]}
        >
          <Input placeholder='Nhập tên cơ sở' />
        </Form.Item>
        <Form.Item
          label='Số điện thoại'
          name='phoneNumber'
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            {
              pattern: /^[0-9]{10,11}$/,
              message: 'Số điện thoại phải có 10-11 chữ số',
            },
          ]}
        >
          <Input placeholder='Nhập số điện thoại' />
        </Form.Item>
        <Form.Item
          label='Tỉnh/Thành phố'
          name='province'
          rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
        >
          <AutoComplete
            options={provinceOptions}
            onSearch={handleProvinceSearch}
            onChange={handleProvinceChange}
            placeholder='Nhập để tìm kiếm tỉnh/thành phố'
            allowClear // Thêm nút X để xóa
          />
          {provincesLoading && <Spin size='small' style={{ marginLeft: 8 }} />}
        </Form.Item>

        <Form.Item
          label='Phường/Xã'
          name='ward'
          rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
        >
          <AutoComplete
            options={wardOptions}
            onSearch={handleWardSearch}
            onChange={handleWardChange}
            placeholder='Nhập để tìm kiếm phường/xã'
            disabled={!selectedProvince}
            allowClear
          />
          {wardsLoading && <Spin size='small' style={{ marginLeft: 8 }} />}
        </Form.Item>
        {/* House Number */}
        <Form.Item
          label='Số nhà/Địa chỉ cụ thể'
          name='houseNumber'
          rules={[
            { required: true, message: 'Vui lòng nhập số nhà/địa chỉ cụ thể' },
          ]}
        >
          <Input
            placeholder='Nhập số nhà, tên đường...'
            onChange={(e) => setHouseNumberValue(e.target.value)}
          />
        </Form.Item>
        {/* Full Address Preview */}
        {selectedProvince && selectedWard && (
          <Form.Item label='Địa chỉ đầy đủ'>
            <Input
              value={`${houseNumberValue || ''}, ${selectedWard.FullName}, ${selectedProvince.FullName}`.trim()}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </Form.Item>
        )}
        <Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button type='primary' htmlType='submit' size='large'>
              Tạo mới
            </Button>
            <Button
              onClick={() =>
                navigate('/admin/facilities?pageNumber=1&pageSize=10')
              }
              size='large'
            >
              Hủy
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateFacilityForm
