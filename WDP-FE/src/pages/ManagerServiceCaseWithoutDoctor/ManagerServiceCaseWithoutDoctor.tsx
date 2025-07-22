"use client"

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
  DatePicker, // Thêm DatePicker
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UserAddOutlined,
  DownOutlined,
  HomeOutlined,
  ShopOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined, // Thêm CalendarOutlined
} from '@ant-design/icons'
import {
  useGetDoctorListQuery,
  useGetServiceCaseNoDoctorListQuery,
  useAddDoctorToServiceCaseMutation,
} from '../../features/manager/doctorAPI'
import moment from 'moment' // Import moment

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
  facility: {
    _id: string
    name: string
  }
  isAtHome?: boolean
  status?: string
}

interface Doctor {
  _id: string
  name: string
  email: string
  phoneNumber: string
  specialization?: string
  experience?: string
}

const ManagerServiceCaseWithoutDoctor: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedBookingDate, setSelectedBookingDate] = useState<string | undefined>(undefined) // State mới cho ngày đặt lịch

  // Fetch danh sách service cases chưa có bác sĩ
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetServiceCaseNoDoctorListQuery({
    pageNumber: 1,
    pageSize: 1000,
    bookingDate: selectedBookingDate, // Truyền bookingDate vào query
  })

  // Fetch danh sách bác sĩ
  const { data: doctorsData, isLoading: isLoadingDoctors } =
    useGetDoctorListQuery({
      pageNumber: 1,
      pageSize: 100,
    })

  // Mutation để gán bác sĩ cho service case
  const [addDoctorToServiceCase, { isLoading: isAssigning }] =
    useAddDoctorToServiceCaseMutation()

  // Xử lý gán bác sĩ cho service case
  const handleAssignDoctor = (serviceCase: ServiceCase, doctor: Doctor) => {
    setSelectedServiceCase(serviceCase)
    setSelectedDoctor(doctor)
    setConfirmModalVisible(true)
  }

  // Xác nhận gán bác sĩ
  const handleConfirmAssignment = async () => {
    if (!selectedServiceCase || !selectedDoctor) return

    try {
      await addDoctorToServiceCase({
        serviceCaseId: selectedServiceCase._id,
        doctorId: selectedDoctor._id,
        data: {},
      }).unwrap()

      message.success(
        `Đã gán bác sĩ ${selectedDoctor.name} cho dịch vụ thành công!`
      )
      setConfirmModalVisible(false)
      setSelectedServiceCase(null)
      setSelectedDoctor(null)
    } catch (error: any) {
      console.error('Error assigning doctor:', error)
      message.error(error?.data?.message || 'Gán bác sĩ thất bại!')
    }
  }

  // Hủy gán bác sĩ
  const handleCancelAssignment = () => {
    setConfirmModalVisible(false)
    setSelectedServiceCase(null)
    setSelectedDoctor(null)
  }

  const getDoctorMenu = (serviceCaseId: string) => {
    const doctors = doctorsData?.data || []

    if (doctors.length === 0) {
      return (
        <Menu
          items={[
            {
              key: 'no-doctors',
              label: <span style={{ color: '#999' }}>Không có bác sĩ nào</span>,
              disabled: true,
            },
          ]}
        />
      )
    }

    return (
      <Menu
        items={doctors.map((doctor: Doctor) => ({
          key: doctor._id,
          label: (
            <div
              onClick={() => {
                const serviceCase = serviceCases.find(
                  (sc) => sc._id === serviceCaseId
                )
                if (serviceCase) {
                  handleAssignDoctor(serviceCase, doctor)
                }
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{doctor.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {doctor.email}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {doctor.phoneNumber}
              </div>
              {doctor.specialization && (
                <div style={{ fontSize: '11px', color: '#999' }}>
                  Chuyên khoa: {doctor.specialization}
                </div>
              )}
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
            {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại dịch vụ',
      key: 'serviceType',
      render: (_, record) => (
        <Tag
          icon={record.isAtHome ? <HomeOutlined /> : <ShopOutlined />}
          color={record.isAtHome ? 'green' : 'blue'}
        >
          {record.isAtHome ? 'Tại nhà' : 'Tại cơ sở'}
        </Tag>
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
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
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
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => <Tag color='orange'>Chưa có bác sĩ</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Dropdown
            overlay={getDoctorMenu(record._id)}
            trigger={['click']}
            disabled={isLoadingDoctors}
          >
            <Button
              type='primary'
              icon={<UserAddOutlined />}
              loading={isLoadingDoctors}
            >
              Gán bác sĩ <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ]

  // Calculate pagination for client-side pagination
  const serviceCases = serviceCasesData?.data || []
  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ chưa có bác sĩ</Title>

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
            Danh sách dịch vụ chưa được gán bác sĩ
          </span>
          {/* Thêm DatePicker vào đây */}
          <DatePicker
            format="YYYY-MM-DD"
            placeholder="Chọn ngày đặt lịch"
            onChange={(date, dateString) => {
              setSelectedBookingDate(dateString || undefined)
              setPageNumber(1) // Reset về trang 1 khi thay đổi ngày
            }}
            style={{ width: 180, marginLeft: "80px"}}
            allowClear
            suffixIcon={<CalendarOutlined />}
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
            Không có dịch vụ nào chưa được gán bác sĩ
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Tất cả dịch vụ đã được phân công bác sĩ phụ trách
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
            locale={{
              emptyText: 'Không có dịch vụ nào chưa được gán bác sĩ',
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
            />
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>Xác nhận gán bác sĩ</span>
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
              <div>• Số điện thoại: {selectedServiceCase?.phoneNumber}</div>
              <div>
                • Ngày đặt:{' '}
                {selectedServiceCase?.bookingDate
                  ? new Date(
                      selectedServiceCase.bookingDate
                    ).toLocaleDateString('vi-VN')
                  : 'N/A'}
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
            <strong>Bác sĩ được chọn:</strong>
            <div style={{ marginLeft: '16px', marginTop: '8px' }}>
              <div>• Tên: {selectedDoctor?.name}</div>
              <div>• Email: {selectedDoctor?.email}</div>
              <div>• Số điện thoại: {selectedDoctor?.phoneNumber}</div>
              {selectedDoctor?.specialization && (
                <div>• Chuyên khoa: {selectedDoctor.specialization}</div>
              )}
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
              Sau khi gán bác sĩ, dịch vụ sẽ được chuyển sang trạng thái "Đã có
              bác sĩ phụ trách" và không thể hoàn tác.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManagerServiceCaseWithoutDoctor