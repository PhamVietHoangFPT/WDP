'use client'

import type React from 'react'
import { useState } from 'react'
import { Form, Input, Button, Typography, message, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  useGetProvinceListQuery,
  useGetDistrictListQuery,
  useGetWardListQuery,
  useCreateFacilityAddressMutation,
} from '../../features/location/location'
import { useCreateFacilityMutation } from '../../features/admin/serviceAPI'
import type { Province, District, Ward } from '../../types/location'
import type { FacilityInfo } from '../../types/facilities'

const { Title } = Typography
const { Option } = Select

const CreateFacilityForm: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

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

  const [createFacilityAddress] = useCreateFacilityAddressMutation()
  const [createFacility] = useCreateFacilityMutation()

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

  const handleSubmit = async (values: any) => {
    try {
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        message.error('Vui lòng chọn đầy đủ thông tin địa chỉ')
        return
      }

      const fullAddress =
        `${values.houseNumber || ''}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`.trim()

      // ✅ Step 1: Create address
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
      setSelectedDistrict(null)
      setSelectedWard(null)
      navigate('/admin/createFacility')
    } catch (error: any) {
      if (error.status === 404) {
        message.error('Tên, số điện thoại hoặc địa chỉ đã tồn tại')
        return
      }
      console.error('Error creating facility:', error)
      message.error(error?.message || 'Có lỗi xảy ra khi tạo cơ sở')
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

        {/* Province */}
        <Form.Item
          label='Thành phố'
          name='province'
          rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
        >
          <Select
            placeholder='Chọn thành phố'
            loading={provincesLoading}
            onChange={handleProvinceChange}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {provincesData?.map((province: Province) => (
              <Option key={province.code} value={province.code}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* District */}
        <Form.Item
          label='Quận'
          name='district'
          rules={[{ required: true, message: 'Vui lòng chọn quận' }]}
        >
          <Select
            placeholder='Chọn quận'
            loading={districtsLoading}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {districtsData?.map((district: District) => (
              <Option key={district.code} value={district.code}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ward */}
        <Form.Item
          label='Phường'
          name='ward'
          rules={[{ required: true, message: 'Vui lòng chọn phường' }]}
        >
          <Select
            placeholder='Chọn phường'
            loading={wardsLoading}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {wardsData?.map((ward: Ward) => (
              <Option key={ward.code} value={ward.code}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* House Number */}
        <Form.Item
          label='Số nhà'
          name='houseNumber'
          rules={[{ required: true, message: 'Vui lòng nhập số nhà' }]}
        >
          <Input placeholder='Nhập số nhà' />
        </Form.Item>

        {selectedProvince && selectedDistrict && selectedWard && (
          <Form.Item label='Địa chỉ đầy đủ'>
            <Input
              value={`${form.getFieldValue('houseNumber') || ''}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`.trim()}
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
            <Button onClick={() => navigate('/admin/facility')} size='large'>
              Hủy
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateFacilityForm
