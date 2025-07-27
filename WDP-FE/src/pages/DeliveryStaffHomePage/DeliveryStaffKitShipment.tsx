import { useState } from 'react'
import {
  useGetKitShipmentForShipperQuery,
  useGetKitShipmentStatusQuery,
  useUpdateKitShipmentStatusMutation,
} from '../../features/kitShipment/kitShipmentAPI'
import { Select, Spin, Table, Tag, Button, message, Space, Result } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

interface KitShipment {
  _id: string
  currentStatus: string
  caseMember: {
    _id: string
    booking: {
      bookingDate: string
      bookingTime: string
      account: {
        name: string
        email: string
        phoneNumber: string
      }
    }
    address: {
      _id: string
      fullAddress: string
    }
  }
}

const DeliveryStaffKitShipment: React.FC = () => {
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<
    string | undefined
  >(undefined)
  const { data, error, isLoading } = useGetKitShipmentForShipperQuery({
    currentStatus: selectedCurrentStatus,
  })
  const { data: kitShipmentStatus } = useGetKitShipmentStatusQuery({})
  const [changeStatus] = useUpdateKitShipmentStatusMutation()

  // Status IDs constants
  const STATUS_IDS = {
    CONFIRMED: '688104fd5153ca0a75de9a67',
    DELIVERED: '688105125153ca0a75de9a6a',
    CANCELLED: '688105695153ca0a75de9a80',
    SAMPLE_SUCCESS: '688105205153ca0a75de9a72',
    SAMPLE_FAILED: '688105775153ca0a75de9a83',
    DELIVERED_TO_FACILITY: '688105455153ca0a75de9a75',
  }

  // Generic status update handler
  const handleStatusUpdate = async (
    kitShipmentId: string,
    statusId: string,
    successMessage: string
  ) => {
    try {
      await changeStatus({
        id: kitShipmentId.toString(),
        currentStatus: statusId.toString(),
      }).unwrap()
      message.success(successMessage)
    } catch (error) {
      console.error('Error updating status:', error)
      message.error('Có lỗi xảy ra khi cập nhật trạng thái!')
    }
  }

  // Specific handlers
  const handleConfirmDelivery = (kitShipmentId: string) =>
    handleStatusUpdate(
      kitShipmentId,
      STATUS_IDS.CONFIRMED,
      'Xác nhận giao hàng thành công!'
    )

  const handleDeliverySuccess = (kitShipmentId: string) =>
    handleStatusUpdate(
      kitShipmentId,
      STATUS_IDS.DELIVERED,
      'Giao kit thành công!'
    )

  const handleDeliveryCancel = (kitShipmentId: string) =>
    handleStatusUpdate(kitShipmentId, STATUS_IDS.CANCELLED, 'Đã hủy giao hàng!')

  const handleSampleSuccess = (kitShipmentId: string) =>
    handleStatusUpdate(
      kitShipmentId,
      STATUS_IDS.SAMPLE_SUCCESS,
      'Lấy mẫu thành công!'
    )

  const handleSampleFailed = (kitShipmentId: string) =>
    handleStatusUpdate(
      kitShipmentId,
      STATUS_IDS.SAMPLE_FAILED,
      'Đã hủy do lấy mẫu thất bại!'
    )

  const handleDeliveredToFacility = (kitShipmentId: string) =>
    handleStatusUpdate(
      kitShipmentId,
      STATUS_IDS.DELIVERED_TO_FACILITY,
      'Đã giao đến cơ sở thành công!'
    )

  // Helper function to render action buttons based on status order
  const renderActionButtons = (record: KitShipment) => {
    const status = kitShipmentStatus?.data?.find(
      (s: { _id: string; status: string; order: number }) =>
        s._id === record.currentStatus
    )

    switch (status?.order) {
      case 1:
        return (
          <Button
            type='primary'
            size='small'
            onClick={() => handleConfirmDelivery(record._id)}
          >
            Xác nhận giao hàng
          </Button>
        )
      case 2:
        return (
          <Space size='small'>
            <Button
              type='primary'
              size='small'
              onClick={() => handleDeliverySuccess(record._id)}
            >
              Giao kit thành công
            </Button>
            <Button
              danger
              size='small'
              onClick={() => handleDeliveryCancel(record._id)}
            >
              Hủy
            </Button>
          </Space>
        )
      case 3:
        return (
          <Space size='small'>
            <Button
              type='primary'
              size='small'
              onClick={() => handleSampleSuccess(record._id)}
            >
              Lấy mẫu thành công
            </Button>
            <Button
              danger
              size='small'
              onClick={() => handleSampleFailed(record._id)}
            >
              Hủy do lấy mẫu thất bại
            </Button>
          </Space>
        )
      case 4:
        return (
          <Button
            type='primary'
            size='small'
            onClick={() => handleDeliveredToFacility(record._id)}
          >
            Đã giao đến cơ sở
          </Button>
        )
      default:
        return null
    }
  }

  // Handle select change
  const handleStatusChange = (value: string) => {
    setSelectedCurrentStatus(value)
  }

  const columns: ColumnsType<KitShipment> = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.caseMember.booking.account.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.caseMember.booking.account.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.caseMember.booking.account.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày hẹn',
      key: 'bookingDate',
      render: (_, record) =>
        new Date(record.caseMember.booking.bookingDate).toLocaleDateString(
          'vi-VN',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }
        ),
      sorter: (a, b) =>
        new Date(a.caseMember.booking.bookingDate).getTime() -
        new Date(b.caseMember.booking.bookingDate).getTime(),
    },
    {
      title: 'Thời gian hẹn',
      key: 'bookingTime',
      render: (_, record) => record.caseMember.booking.bookingTime,
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_, record) => record.caseMember.address.fullAddress || 'N/A',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const status = kitShipmentStatus?.data?.find(
          (s: { _id: string; status: string }) => s._id === record.currentStatus
        )
        return (
          <Tag color='orange'>
            {status?.status || 'Chưa có nhân viên giao hàng'}
          </Tag>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => renderActionButtons(record),
    },
  ]
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Vận chuyển bộ dụng cụ</h1>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>
            Danh sách bộ lấy mẫu xét nghiệm cần giao
          </span>
          <Select
            style={{ width: 200 }}
            placeholder='Chọn trạng thái'
            value={selectedCurrentStatus}
            onChange={handleStatusChange}
            allowClear
          >
            {kitShipmentStatus?.data?.map(
              (status: { _id: string; status: string; order: number }) => (
                <Option key={status._id} value={status._id}>
                  {status.status}
                </Option>
              )
            )}
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
          }}
        >
          <Spin size='large' />
        </div>
      ) : error ? (
        <Result
          status='error'
          title='Lỗi tải dữ liệu'
          subTitle='Không thể tải danh sách vận chuyển bộ dụng cụ. Vui lòng thử lại sau.'
          extra={[
            <Button
              type='primary'
              key='retry'
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>,
          ]}
        />
      ) : (
        <div>
          <p>Tổng số records: {data?.length || 0}</p>
          <Table
            dataSource={data || []}
            columns={columns}
            rowKey='_id'
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: 'Không có dữ liệu',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DeliveryStaffKitShipment
