'use client'

import { useState } from 'react'
import Cookies from 'js-cookie' // Import Cookies nếu account ID được lưu ở đây
import {
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
  useCreateAddressMutation,
  useUpdateAddressMutation, // Import mutation để cập nhật địa chỉ
  useDeleteAddressMutation, // Import mutation để xóa địa chỉ
} from '../../features/address/addressAPI'
import {
  useGetProvinceListQuery, // Import query để lấy danh sách tỉnh
  useGetWardListQuery, // Import query để lấy danh sách phường/xã
} from '../../features/location/location'
// 1. Import các component cần thiết từ Ant Design
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Spin,
  Result,
  Tooltip,
  message,
  Modal, // Import Modal
  Form, // Import Form
  Input, // Import Input
  Select, // Import Select
  Popconfirm, // Import Popconfirm cho xác nhận xóa
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

export default function ManageAddress() {
  // 2. Gọi API để lấy dữ liệu địa chỉ hiện có
  const { data, isLoading, isError, refetch } = useGetAddressesQuery({})
  const [setDefaultAddress, { isLoading: isUpdating }] =
    useSetDefaultAddressMutation()
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation()
  const [updateAddress, { isLoading: isUpdatingAddress }] =
    useUpdateAddressMutation()
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation()

  const [updatingId, setUpdatingId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false) // State để quản lý Modal
  const [isEditMode, setIsEditMode] = useState(false) // State để phân biệt tạo mới hay chỉnh sửa
  const [editingAddress, setEditingAddress] = useState(null) // State lưu địa chỉ đang chỉnh sửa
  const [form] = Form.useForm() // Khởi tạo form instance

  // States cho Dropdown Tỉnh/Thành, Phường/Xã
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null)
  const [fullAddressDisplay, setFullAddressDisplay] = useState('') // Để hiển thị địa chỉ đầy đủ tạm thời

  // Lấy danh sách Tỉnh/Thành
  const { data: provincesData, isLoading: provincesLoading } =
    useGetProvinceListQuery({
      pageNumber: 1,
      pageSize: 1000,
    })

  // Lấy danh sách Phường/Xã dựa trên Tỉnh/Thành đã chọn
  const { data: wardsData, isLoading: wardsLoading } = useGetWardListQuery(
    {
      pageNumber: 1,
      pageSize: 1000,
      province_code: selectedProvinceCode,
    },
    { skip: !selectedProvinceCode } // Chỉ fetch khi đã chọn tỉnh
  )

  // 3. Xử lý trạng thái tải (Loading)
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin size='large' tip='Đang tải dữ liệu...' />
      </div>
    )
  }

  // 4. Xử lý trạng thái lỗi (Error)
  if (isError) {
    return (
      <Result
        status='error'
        title='Tải dữ liệu thất bại'
        subTitle='Rất tiếc, đã có lỗi xảy ra trong quá trình tải sổ địa chỉ. Vui lòng thử lại.'
        extra={[
          <Button
            type='primary'
            key='console'
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>,
        ]}
      />
    )
  }

  const addressList = data?.data || []

  // 5. Cập nhật hàm xử lý thành async để dùng await và try/catch
  const handleSetDefault = async (addressId) => {
    setUpdatingId(addressId) // Bắt đầu loading cho hàng này
    try {
      const payload = await setDefaultAddress(addressId).unwrap()
      message.success(
        payload.message || 'Cập nhật địa chỉ mặc định thành công!'
      )
    } catch (err) {
      message.error(err.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Hàm xử lý khi mở Modal "Thêm địa chỉ mới"
  const handleAddAddressClick = () => {
    form.resetFields() // Reset form khi mở modal
    setSelectedProvinceCode(null) // Reset tỉnh/thành đã chọn
    setFullAddressDisplay('') // Reset hiển thị địa chỉ đầy đủ
    setIsEditMode(false) // Đặt về chế độ tạo mới
    setEditingAddress(null) // Reset địa chỉ đang chỉnh sửa
    setIsModalVisible(true)
  }

  // Hàm xử lý khi mở Modal "Chỉnh sửa địa chỉ"
  const handleEditAddressClick = (address) => {
    setIsEditMode(true) // Đặt về chế độ chỉnh sửa
    setEditingAddress(address) // Lưu địa chỉ đang chỉnh sửa

    // Parse địa chỉ hiện tại để lấy thông tin
    const addressParts = address.fullAddress.split(', ')
    const street = addressParts[0] || ''

    // Tìm province và ward từ dữ liệu hiện có
    const currentProvince = provincesData?.find((p) =>
      address.province_name?.includes(p.FullName)
    )
    const provinceCode = currentProvince?.Code || address.province_code

    setSelectedProvinceCode(provinceCode)

    // Set form values
    form.setFieldsValue({
      street: street,
      province_code: provinceCode,
      ward_code: address.ward_code,
    })

    setFullAddressDisplay(address.fullAddress)
    setIsModalVisible(true)
  }

  // Hàm xử lý khi đóng Modal
  const handleCancelModal = () => {
    setIsModalVisible(false)
    setIsEditMode(false)
    setEditingAddress(null)
  }

  // Hàm xử lý khi gửi form (tạo mới hoặc cập nhật)
  const handleSubmitAddress = async (values) => {
    try {
      // Logic để lấy tên tỉnh/phường từ code
      const selectedProvince = provincesData?.find(
        (p) => p.Code === values.province_code
      )
      const selectedWard = wardsData?.find((w) => w.Code === values.ward_code)

      // Xây dựng fullAddress
      const displayParts = []
      if (values.street) displayParts.push(values.street)
      if (selectedWard) displayParts.push(selectedWard.FullName)
      if (selectedProvince) displayParts.push(selectedProvince.FullName)

      const generatedFullAddress = displayParts.join(', ')

      const addressData = {
        // street: values.street,
        // province_code: values.province_code,
        // province_name: selectedProvince ? selectedProvince.FullName : "",
        // ward_code: values.ward_code,
        // ward_name: selectedWard ? selectedWard.FullName : "",
        fullAddress: generatedFullAddress,
        isKitShippingAddress: false,
      }

      if (isEditMode && editingAddress) {
        // Cập nhật địa chỉ
        const payload = await updateAddress({
          id: editingAddress._id,
          data: addressData,
        }).unwrap()
        message.success(payload.message || 'Cập nhật địa chỉ thành công!')
      } else {
        // Tạo địa chỉ mới
        const userDataString = Cookies.get('userData')
        let userData = {}
        if (userDataString) {
          try {
            userData = JSON.parse(decodeURIComponent(userDataString))
          } catch (error) {
            console.error('Lỗi khi parse userData từ cookie:', error)
          }
        }
        const accountId = userData.id

        addressData.account = accountId
        const payload = await createAddress(addressData).unwrap()
        message.success(payload.message || 'Thêm địa chỉ mới thành công!')
      }

      setIsModalVisible(false) // Đóng modal sau khi thành công
      refetch() // Làm mới danh sách địa chỉ
    } catch (err) {
      message.error(err.data?.message || 'Có lỗi xảy ra khi xử lý địa chỉ.')
    }
  }

  // Hàm xử lý xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    try {
      const payload = await deleteAddress(addressId).unwrap()
      message.success(payload.message || 'Xóa địa chỉ thành công!')
      refetch() // Làm mới danh sách địa chỉ
    } catch (err) {
      message.error(err.data?.message || 'Có lỗi xảy ra khi xóa địa chỉ.')
    }
  }

  // Cập nhật trường fullAddressDisplay khi các trường địa chỉ thay đổi
  const updateFullAddressDisplay = () => {
    const values = form.getFieldsValue()
    const { street, ward_code, province_code } = values

    const displayParts = []
    if (street) displayParts.push(street)

    const selectedWard = wardsData?.find((w) => w.Code === ward_code)
    if (selectedWard) displayParts.push(selectedWard.FullName)

    const selectedProvince = provincesData?.find(
      (p) => p.Code === province_code
    )
    if (selectedProvince) displayParts.push(selectedProvince.FullName)

    setFullAddressDisplay(displayParts.join(', '))
  }

  // Xử lý khi thay đổi tỉnh/thành phố
  const handleProvinceChange = (value) => {
    setSelectedProvinceCode(value)
    form.setFieldsValue({ ward_code: undefined }) // Reset phường/xã khi thay đổi tỉnh
    updateFullAddressDisplay()
  }

  // Xử lý khi thay đổi phường/xã
  const handleWardChange = (value) => {
    updateFullAddressDisplay()
  }

  const columns = [
    {
      title: 'Số thứ tự',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      align: 'center',
      render: (_, record) =>
        record.isKitShippingAddress ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color='success'
            style={{ padding: '4px 8px', fontSize: '13px' }}
          >
            Mặc định
          </Tag>
        ) : (
          <Button
            type='link'
            onClick={() => handleSetDefault(record._id)}
            loading={isUpdating && updatingId === record._id}
            disabled={isUpdating && updatingId !== record._id}
          >
            Đặt làm mặc định
          </Button>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          {/* <Tooltip title='Chỉnh sửa'>
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => handleEditAddressClick(record)}
            />
          </Tooltip> */}
          <Tooltip title='Xóa'>
            <Popconfirm
              title='Xác nhận xóa'
              description='Bạn có chắc chắn muốn xóa địa chỉ này?'
              onConfirm={() => handleDeleteAddress(record._id)}
              okText='Xóa'
              cancelText='Hủy'
              okButtonProps={{ danger: true, loading: isDeleting }}
            >
              <Button
                type='text'
                danger
                icon={<DeleteOutlined />}
                disabled={record.isKitShippingAddress}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px', background: '#f0f2f5' }}>
      <Card
        title={
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Sổ địa chỉ của tôi
          </span>
        }
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleAddAddressClick}
          >
            Thêm địa chỉ mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={addressList}
          rowKey='_id'
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={isEditMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmitAddress}
          onValuesChange={updateFullAddressDisplay}
        >
          <Form.Item
            name='street'
            label='Địa chỉ cụ thể (Số nhà, đường, hẻm)'
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' },
            ]}
          >
            <Input placeholder='Ví dụ: 123 Nguyễn Trãi' />
          </Form.Item>

          <Form.Item
            name='province_code'
            label='Tỉnh/Thành phố'
            rules={[
              { required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' },
            ]}
          >
            <Select
              placeholder='Chọn Tỉnh/Thành phố'
              showSearch
              optionFilterProp='children'
              loading={provincesLoading}
              onChange={handleProvinceChange}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >=
                0
              }
            >
              {provincesData?.map((province) => (
                <Select.Option key={province.Code} value={province.Code}>
                  {province.FullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='ward_code'
            label='Phường/Xã'
            rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
          >
            <Select
              placeholder='Chọn Phường/Xã'
              showSearch
              optionFilterProp='children'
              loading={wardsLoading}
              disabled={!selectedProvinceCode} // Chỉ cho phép chọn khi có tỉnh
              onChange={handleWardChange}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >=
                0
              }
            >
              {wardsData?.map((ward) => (
                <Select.Option key={ward.Code} value={ward.Code}>
                  {ward.FullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label='Địa chỉ đầy đủ (Tự động cập nhật)'>
            <Input value={fullAddressDisplay} readOnly />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={handleCancelModal}>Hủy</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={isEditMode ? isUpdatingAddress : isCreating}
              >
                {isEditMode ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
