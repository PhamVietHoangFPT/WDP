import { useState } from 'react'
import type { KitShipment } from '../../types/kitShipment'
import type { DeliveryStaff } from '../../types/deliveryStaff'
import {
  useAssignDeliveryStaffToKitShipmentMutation,
  useGetDeliveryStaffListQuery,
  useGetKitShipmentWithoutDeliveryStaffListQuery,
} from '../../features/manager/sampleCollectorAPI'
import type { ColumnsType } from 'antd/es/table'
import {
  DatePicker,
  Table,
  Tag,
  Spin,
  message,
  Space,
  Dropdown,
  Button,
  Modal,
} from 'antd'
import {
  CalendarOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons'

interface KitShipmentResponse {
  data: {
    data: KitShipment[]
  }
  isLoading: boolean
}

const ManagerKitShipmentPage: React.FC = () => {
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false)
  const [selectedKitShipment, setSelectedKitShipment] =
    useState<KitShipment | null>(null)
  const [selectedDeliveryStaff, setSelectedDeliveryStaff] =
    useState<DeliveryStaff | null>(null)

  const [selectedBookingDate, setSelectedBookingDate] = useState<
    string | undefined
  >(undefined) // State mới cho ngày đặt lịch

  // Hàm để disable ngày đã qua so với ngày hiện tại
  const disabledDate = (current: any) => {
    // Disable ngày trước ngày hiện tại
    return current && current < new Date().setHours(0, 0, 0, 0)
  }

  const { data: kitShipmentsData, isLoading: isLoadingKitShipments } =
    useGetKitShipmentWithoutDeliveryStaffListQuery<KitShipmentResponse>({
      bookingDate: selectedBookingDate, // Truyền bookingDate vào query
    })
  const kitShipmentsList = kitShipmentsData?.data || []
  const { data: deliveryStaffListData, isLoading: isLoadingDeliveryStaff } =
    useGetDeliveryStaffListQuery({})

  // Mutation để gán bác sĩ cho service case
  const [assignDeliveryStaff, { isLoading: isAssigning }] =
    useAssignDeliveryStaffToKitShipmentMutation()

  // Xử lý gán nhân viên giao hàng cho đơn hàng
  const handleAssignDeliveryStaff = (
    kitShipment: KitShipment,
    deliveryStaff: DeliveryStaff
  ) => {
    setSelectedKitShipment(kitShipment)
    setSelectedDeliveryStaff(deliveryStaff)
    setConfirmModalVisible(true)
  }

  // Xác nhận gán nhân viên giao hàng
  const handleConfirmAssignment = async () => {
    if (!selectedKitShipment || !selectedDeliveryStaff) return

    try {
      await assignDeliveryStaff({
        kitShipmentId: selectedKitShipment._id.toString(),
        deliveryStaffId: selectedDeliveryStaff._id.toString(),
      }).unwrap()

      message.success(
        `Đã gán nhân viên giao hàng ${selectedDeliveryStaff.name} cho đơn hàng thành công!`
      )
      setConfirmModalVisible(false)
      setSelectedKitShipment(null)
      setSelectedDeliveryStaff(null)
    } catch (error: any) {
      console.error('Error assigning delivery staff:', error)
      message.error(error?.data?.message || 'Gán nhân viên giao hàng thất bại!')
    }
  }

  // Hủy gán bác sĩ
  const handleCancelAssignment = () => {
    setConfirmModalVisible(false)
    setSelectedDeliveryStaff(null)
    setSelectedKitShipment(null)
  }

  const getDeliveryStaffMenu = (kitShipmentId: string) => {
    const deliveryStaffList = deliveryStaffListData?.data || []

    if (deliveryStaffList.length === 0) {
      return {
        items: [
          {
            key: 'no-delivery-staff',
            label: (
              <span style={{ color: '#999' }}>
                Không có nhân viên giao hàng nào
              </span>
            ),
            disabled: true,
          },
        ],
      }
    }

    return {
      items: deliveryStaffList.map((staff: DeliveryStaff) => ({
        key: staff._id,
        label: (
          <div
            onClick={() => {
              const kitShipment = kitShipmentsList.find(
                (sc) => sc._id === kitShipmentId
              )
              if (kitShipment) {
                handleAssignDeliveryStaff(kitShipment, staff)
              }
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{staff.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{staff.email}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {staff.phoneNumber}
            </div>
          </div>
        ),
      })),
    }
  }

  const columns: ColumnsType<KitShipment> = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.account.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.account.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.account.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: 'Thời gian hẹn',
      dataIndex: 'bookingTime',
      key: 'bookingTime',
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_, record) => record?.address?.fullAddress || 'N/A',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_) => <Tag color='orange'>Chưa có nhân viên giao hàng</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Dropdown
            menu={getDeliveryStaffMenu(record._id)}
            trigger={['click']}
            disabled={isLoadingDeliveryStaff}
          >
            <Button type='primary' icon={<UserAddOutlined />}>
              Gán nhân viên giao hàng <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1>Quản trị vận chuyển bộ dụng cụ</h1>
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
            Danh sách bộ lấy mẫu xét nghiệm chưa có nhân viên giao hàng
          </span>
          {/* Thêm DatePicker vào đây */}
          <DatePicker
            format='YYYY-MM-DD'
            placeholder='Chọn ngày đặt lịch'
            onChange={(date, dateString) => {
              setSelectedBookingDate(
                typeof dateString === 'string' ? dateString : undefined
              )
            }}
            style={{ width: 180, marginLeft: '80px' }}
            allowClear
            suffixIcon={<CalendarOutlined />}
          />
        </div>
      </div>
      {isLoadingKitShipments ? (
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
      ) : (
        <Table
          dataSource={kitShipmentsList || []}
          columns={columns}
          rowKey='_id'
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'Không có dịch vụ nào chưa được gán bác sĩ',
          }}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>Xác nhận gán nhân viên giao hàng</span>
          </div>
        }
        open={confirmModalVisible}
        onOk={handleConfirmAssignment}
        onCancel={handleCancelAssignment}
        confirmLoading={isAssigning}
        okText='Xác nhận gán'
        cancelText='Hủy'
        okButtonProps={{ type: 'primary' }}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Thông tin dịch vụ:</strong>
            <div style={{ marginLeft: '16px', marginTop: '8px' }}>
              <div>• Khách hàng: {selectedKitShipment?.account.name}</div>
              <div>• Email: {selectedKitShipment?.account.email}</div>
              <div>
                • Số điện thoại: {selectedKitShipment?.account.phoneNumber}
              </div>
              <div>
                • Ngày đặt:{' '}
                {selectedKitShipment?.bookingDate
                  ? new Date(
                      selectedKitShipment.bookingDate
                    ).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong>Nhân viên giao hàng được chọn:</strong>
            <div style={{ marginLeft: '16px', marginTop: '8px' }}>
              <div>• Tên: {selectedDeliveryStaff?.name}</div>
              <div>• Email: {selectedDeliveryStaff?.email}</div>
              <div>• Số điện thoại: {selectedDeliveryStaff?.phoneNumber}</div>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
              border: '1px solid #ffd591',
            }}
          >
            <strong style={{ color: '#d46b08' }}>⚠️ Lưu ý:</strong>
            <div style={{ color: '#d46b08', marginTop: '4px' }}>
              Sau khi gán nhân viên giao hàng, dịch vụ sẽ được chuyển sang trạng
              thái "Đã có nhân viên giao hàng phụ trách" và không thể hoàn tác.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default ManagerKitShipmentPage
