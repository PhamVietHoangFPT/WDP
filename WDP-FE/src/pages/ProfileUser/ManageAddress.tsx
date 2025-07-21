import { useState } from 'react'

import {
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
} from '../../features/address/addressAPI'

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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

export default function ManageAddress() {
  // 2. Gọi API để lấy dữ liệu
  const { data, isLoading, isError } = useGetAddressesQuery({})
  const [setDefaultAddress, { isLoading: isUpdating }] =
    useSetDefaultAddressMutation()

  const [updatingId, setUpdatingId] = useState(null)
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
      // Dùng .unwrap() để nhận về một Promise, giúp bắt lỗi dễ dàng
      const payload = await setDefaultAddress(addressId).unwrap()

      // Hiển thị thông báo thành công từ API
      message.success(
        payload.message || 'Cập nhật địa chỉ mặc định thành công!'
      )
    } catch (err) {
      // Hiển thị thông báo lỗi
      message.error(err.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      // Dù thành công hay thất bại, cũng phải tắt loading
      setUpdatingId(null)
    }
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
      // Dùng render để có thể tùy biến hiển thị nếu cần
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180, // Tăng độ rộng một chút
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
      width: 180, // Điều chỉnh lại độ rộng
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title='Xóa'>
            <Button type='text' danger icon={<DeleteOutlined />} />
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
          <Button type='primary' icon={<PlusOutlined />}>
            Thêm địa chỉ mới
          </Button>
        }
      >
        {/* 6. Sử dụng component Table của AntD để hiển thị dữ liệu */}
        <Table
          columns={columns}
          dataSource={addressList}
          rowKey='_id'
          pagination={{ pageSize: 5 }}
          // Bỏ `bordered`
        />
      </Card>
    </div>
  )
}
