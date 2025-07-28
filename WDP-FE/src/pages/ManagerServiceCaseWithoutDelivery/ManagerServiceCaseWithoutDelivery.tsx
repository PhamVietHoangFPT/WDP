'use client'

import type React from 'react'
import { useState } from 'react'
import {
  Table,
  Button,
  Typography,
  Spin,
  Pagination,
  message,
  Space,
  Dropdown,
  Menu,
  Tag,
  Modal,
  DatePicker,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UserAddOutlined,
  DownOutlined,
  HomeOutlined,
  ShopOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import {
  useGetDeliveryStaffListQuery, // Đổi từ useGetDoctorListQuery
  useGetServiceCaseNoDeliveryStaffListQuery, // Đổi từ useGetServiceCaseNoDoctorListQuery
  useAddDeliveryStaffToServiceCaseMutation, // Đổi từ useAddDoctorToServiceCaseMutation
} from '../../features/manager/deliveryStaffAPI' // Thay đổi đường dẫn import API
import moment from 'moment'

const { Title } = Typography

interface ServiceCase {
  _id: string
  totalFee: number
  account: {
    _id: string
    name: string
    email: string
  }
  phoneNumber: string
  bookingDate: string
  bookingTime: string // Thêm bookingTime từ API response
  facility: {
    _id: string
    name: string
  }
  isAtHome?: boolean
  currentStatus?: string // Đổi từ status sang currentStatus
  created_at?: string // Thêm created_at
}

interface DeliveryStaff {
  _id: string
  name: string
  email: string
  phoneNumber: string
}

const ManagerServiceCaseWithoutDelivery: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [selectedDeliveryStaff, setSelectedDeliveryStaff] =
    useState<DeliveryStaff | null>(null) // Đổi từ selectedDoctor
  const [selectedBookingDate, setSelectedBookingDate] = useState<
    string | undefined
  >(undefined)

  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetServiceCaseNoDeliveryStaffListQuery({
    // Đổi hook query
    pageNumber: 1,
    pageSize: 100,
    bookingDate: selectedBookingDate,
  })

  const {
    data: deliveryStaffsData,
    isLoading: isLoadingDeliveryStaffs,
  } = // Đổi từ doctorsData và isLoadingDoctors
    useGetDeliveryStaffListQuery({
      // Đổi hook query
      pageNumber: 1,
      pageSize: 100,
    })

  const [addDeliveryStaffToServiceCase, { isLoading: isAssigning }] = // Đổi hook mutation
    useAddDeliveryStaffToServiceCaseMutation() // Đổi hook mutation

  const handleAssignDeliveryStaff = (
    serviceCase: ServiceCase,
    deliveryStaff: DeliveryStaff
  ) => {
    // Đổi tên hàm và param
    setSelectedServiceCase(serviceCase)
    setSelectedDeliveryStaff(deliveryStaff) // Đổi từ selectedDoctor
    setConfirmModalVisible(true)
  }

  const handleConfirmAssignment = async () => {
    if (!selectedServiceCase || !selectedDeliveryStaff) return // Đổi từ selectedDoctor

    try {
      await addDeliveryStaffToServiceCase({
        // Đổi hook mutation
        serviceCaseId: selectedServiceCase._id,
        deliveryStaffId: selectedDeliveryStaff._id, // Đổi từ doctorId
        data: {},
      }).unwrap()

      message.success(
        `Đã gán nhân viên giao hàng ${selectedDeliveryStaff.name} cho dịch vụ thành công!` // Đổi thông báo
      )
      setConfirmModalVisible(false)
      setSelectedServiceCase(null)
      setSelectedDeliveryStaff(null) // Đổi từ selectedDoctor
    } catch (error: any) {
      console.error('Error assigning delivery staff:', error) // Đổi thông báo
      message.error(error?.data?.message || 'Gán nhân viên giao hàng thất bại!') // Đổi thông báo
    }
  }

  const handleCancelAssignment = () => {
    setConfirmModalVisible(false)
    setSelectedServiceCase(null)
    setSelectedDeliveryStaff(null) // Đổi từ selectedDoctor
  }

  const getDeliveryStaffMenu = (serviceCaseId: string) => {
    // Đổi tên hàm
    const deliveryStaffs = deliveryStaffsData?.data || [] // Đổi từ doctorsData

    if (deliveryStaffs.length === 0) {
      return (
        <Menu
          items={[
            {
              key: 'no-delivery-staffs', // Đổi key
              label: (
                <span style={{ color: '#999' }}>
                  Không có nhân viên giao hàng nào
                </span>
              ), // Đổi label
              disabled: true,
            },
          ]}
        />
      )
    }

    return (
      <Menu
        items={deliveryStaffs.map((deliveryStaff: DeliveryStaff) => ({
          // Đổi từ Doctor sang DeliveryStaff
          key: deliveryStaff._id,
          label: (
            <div
              onClick={() => {
                const serviceCase = serviceCases.find(
                  (sc) => sc._id === serviceCaseId
                )
                if (serviceCase) {
                  handleAssignDeliveryStaff(serviceCase, deliveryStaff) // Đổi hàm gọi
                }
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{deliveryStaff.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {deliveryStaff.email}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {deliveryStaff.phoneNumber}
              </div>
            </div>
          ),
        }))}
      />
    )
  }

  const columns: ColumnsType<ServiceCase> = [
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
            {record.account.phoneNumber}{' '}
            {/* Thay record.phoneNumber bằng record.account.phoneNumber */}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date: string, record) => {
        const formattedDate = new Date(date).toLocaleDateString('vi-VN')
        return (
          <>
            <div>{formattedDate}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              ({record.bookingTime})
            </div>
          </>
        )
      },
      sorter: (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: 'Tổng phí',
      dataIndex: 'totalFee',
      key: 'totalFee',
      render: (fee: number) => `${fee.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.totalFee - b.totalFee,
    },
    {
      title: 'Cơ sở',
      key: 'facility',
      render: (_, record) => record.facility?.name || 'N/A',
    },
    {
      title: 'Trạng thái hiện tại', // Đổi tên cột
      key: 'currentStatus',
      render: (_, record) => <Tag color='orange'>{record.currentStatus}</Tag>, // Lấy từ currentStatus
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Dropdown
            overlay={getDeliveryStaffMenu(record._id)} // Đổi tên hàm gọi
            trigger={['click']}
            disabled={isLoadingDeliveryStaffs} // Đổi từ isLoadingDoctors
          >
            <Button
              type='primary'
              icon={<UserAddOutlined />}
              loading={isLoadingDeliveryStaffs} // Đổi từ isLoadingDoctors
            >
              Gán nhân viên giao hàng <DownOutlined /> {/* Đổi text hiển thị */}
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ]

  const serviceCases = serviceCasesData?.data || []
  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)

  const disabledDate = (current: moment.Moment) => {
    return current && current < moment().startOf('day')
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ chưa có nhân viên giao hàng</Title>{' '}
      {/* Đổi Title */}
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
            Danh sách dịch vụ chưa được gán nhân viên giao hàng {/* Đổi text */}
          </span>
          <DatePicker
            format='YYYY-MM-DD'
            placeholder='Chọn ngày đặt lịch'
            onChange={(date, dateString) => {
              setSelectedBookingDate(dateString || undefined)
              setPageNumber(1)
            }}
            style={{ width: 180, marginLeft: '80px' }}
            allowClear
            suffixIcon={<CalendarOutlined />}
            disabledDate={disabledDate}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Tổng: {serviceCasesError?.status === 404 ? 0 : totalItems} dịch vụ
          </span>
        </div>
      </div>
      {isLoadingServices ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : serviceCasesError && serviceCasesError.status === 404 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div
            style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}
          >
            Không có dịch vụ nào chưa được gán nhân viên giao hàng{' '}
            {/* Đổi text */}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Tất cả dịch vụ đã được phân công nhân viên giao hàng phụ trách{' '}
            {/* Đổi text */}
          </div>
        </div>
      ) : serviceCasesError ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div style={{ fontSize: '16px', color: '#ff4d4f' }}>
            Có lỗi xảy ra khi tải dữ liệu:{' '}
            {serviceCasesError.data?.message || 'Unknown error'}
          </div>
        </div>
      ) : (
        <>
          <Table
            dataSource={paginatedData}
            columns={columns}
            rowKey='_id'
            pagination={false}
            loading={isFetchingServices}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText:
                'Không có dịch vụ nào chưa được gán nhân viên giao hàng', // Đổi text
            }}
          />

          {totalItems > 0 && (
            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={totalItems}
              style={{ textAlign: 'center', paddingTop: 20 }}
              onChange={(page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} dịch vụ`
              }
              pageSizeOptions={['5', '10', '20']}
            />
          )}
        </>
      )}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>Xác nhận gán nhân viên giao hàng</span> {/* Đổi Title */}
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
              <div>• Khách hàng: {selectedServiceCase?.account.name}</div>
              <div>• Email: {selectedServiceCase?.account.email}</div>
              <div>
                • Số điện thoại: {selectedServiceCase?.account.phoneNumber}
              </div>{' '}
              {/* Thay selectedServiceCase?.phoneNumber */}
              <div>
                • Ngày đặt:{' '}
                {selectedServiceCase?.bookingDate
                  ? new Date(
                      selectedServiceCase.bookingDate
                    ).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </div>
              <div>
                • Giờ hẹn: {selectedServiceCase?.bookingTime || 'N/A'}{' '}
                {/* Thêm bookingTime */}
              </div>
              <div>
                • Tổng phí:{' '}
                {selectedServiceCase?.totalFee
                  ? `${selectedServiceCase.totalFee.toLocaleString('vi-VN')} VNĐ`
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong>Nhân viên giao hàng được chọn:</strong> {/* Đổi text */}
            <div style={{ marginLeft: '16px', marginTop: '8px' }}>
              <div>• Tên: {selectedDeliveryStaff?.name}</div>{' '}
              {/* Đổi từ selectedDoctor */}
              <div>• Email: {selectedDeliveryStaff?.email}</div>{' '}
              {/* Đổi từ selectedDoctor */}
              <div>
                • Số điện thoại: {selectedDeliveryStaff?.phoneNumber}
              </div>{' '}
              {/* Đổi từ selectedDoctor */}
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
              thái "Đã có nhân viên giao hàng phụ trách" và không thể hoàn tác.{' '}
              {/* Đổi text */}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManagerServiceCaseWithoutDelivery
