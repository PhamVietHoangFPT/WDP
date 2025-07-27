'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Table,
  Typography,
  Spin,
  Pagination,
  Select,
  Tag,
  Button,
  Modal,
  message,
  Space,
  Tooltip,
  Empty,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  useGetAllServiceCasesForDeliveryQuery,
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
} from '../../features/deliveryStaff/deliveryStaff'
import {
  UserOutlined, // Giữ lại nếu mày dùng sau này, hiện tại không dùng
  PhoneOutlined, // Giữ lại nếu mày dùng sau này, hiện tại không dùng
  EnvironmentOutlined, // Giữ lại nếu mày dùng sau này, hiện tại không dùng
  CarOutlined, // Giữ lại nếu mày dùng sau này, hiện tại không dùng
} from '@ant-design/icons'

const { Title } = Typography

interface ServiceCase {
  _id: string
  caseMember: {
    testTaker: string[]
  }
  bookingDate: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const DeliveryStaffServiceCase: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>('')
  const [updateModalVisible, setUpdateModalVisible] = useState(false)

  const {
    data: statusListData,
    isLoading: isLoadingStatus,
    isSuccess: isStatusListSuccess,
  } = useGetServiceCaseStatusListForDeliveryQuery({ pageNumber: 1, pageSize: 100 })

  // Đảm bảo status mặc định được set và query chính được kích hoạt
  useEffect(() => {
    if (isStatusListSuccess && statusListData?.data?.length && selectedStatus === undefined) {
      const defaultStatus = statusListData.data.find((s: ServiceCaseStatus) => s.testRequestStatus === 'Đã có kết quả')
      if (defaultStatus) {
        setSelectedStatus(defaultStatus._id)
      } else if (statusListData.data.length > 0) {
        // Fallback: nếu không có "Đã có kết quả", chọn cái đầu tiên
        setSelectedStatus(statusListData.data[0]._id)
      }
    }
  }, [statusListData, isStatusListSuccess, selectedStatus])

  const {
    data: serviceCasesData,
    isLoading: isLoadingCases,
    isFetching: isFetchingCases, // Dùng isFetching để biết khi nào đang tải lại dữ liệu
    refetch,
  } = useGetAllServiceCasesForDeliveryQuery(
    { serviceCaseStatus: selectedStatus, pageNumber, pageSize },
    { skip: selectedStatus === undefined } // Bỏ qua query nếu chưa có trạng thái được chọn
  )

  // Gọi refetch khi selectedStatus, pageNumber hoặc pageSize thay đổi
  useEffect(() => {
    // Chỉ refetch khi selectedStatus đã được định nghĩa (nghĩa là đã có giá trị ban đầu hoặc được người dùng chọn)
    if (selectedStatus !== undefined) {
      refetch()
    }
  }, [selectedStatus, pageNumber, pageSize, refetch])

  const [updateStatus, { isLoading: isUpdating }] = useUpdateServiceCaseStatusForDeliveryMutation()

  const getAvailableNextStatuses = (statusId: string) => {
    const current = statusListData?.data?.find((s: ServiceCaseStatus) => s._id === statusId)
    return statusListData?.data?.filter((s: ServiceCaseStatus) => s.order > (current?.order || -1)) || []
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return
    try {
      await updateStatus({ id: selectedServiceCase._id, currentStatus: newStatusId }).unwrap()
      message.success('Cập nhật trạng thái thành công')
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      setNewStatusId('')
      refetch() // Refetch dữ liệu sau khi cập nhật thành công
    } catch (error: any) {
      message.error(error?.data?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      key: '_id',
      width: 150,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
  title: 'Trạng thái hiện tại',
  key: 'currentStatus',
  width: 200,
  render: (_, record) => {
    let color = 'default'; // Mặc định
    if (record.currentStatus?.testRequestStatus === 'Đã có kết quả') {
      color = 'blue';
    } else if (record.currentStatus?.testRequestStatus === 'Đã trả kết quả') {
      color = 'green';
    } else {
      color = 'red'; // Các trạng thái còn lại là màu đỏ
    }
    return (
      <Tag color={color}>
        {record.currentStatus?.testRequestStatus || '—'}
      </Tag>
    );
  },
},
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => {
        const isUpdatable = record.currentStatus?.testRequestStatus === 'Đã có kết quả'
        const availableNextStatuses = getAvailableNextStatuses(record.currentStatus?._id)

        if (!isUpdatable || availableNextStatuses.length === 0) {
          return <Tag color='default'>Không thể cập nhật</Tag>
        }

        return (
          <Space>
            {availableNextStatuses.map((status: ServiceCaseStatus) => (
              <Button
                key={status._id}
                onClick={() => {
                  setSelectedServiceCase(record)
                  setNewStatusId(status._id)
                  setUpdateModalVisible(true)
                }}
                type='primary'
                danger={
                  status.testRequestStatus.toLowerCase().includes('không thành') ||
                  status.testRequestStatus.toLowerCase().includes('hủy')
                }
              >
                {status.testRequestStatus}
              </Button>
            ))}
          </Space>
        )
      },
    },
  ]

  // === LOGIC QUAN TRỌNG ĐỂ XỬ LÝ HIỂN THỊ DỮ LIỆU VÀ TRẠNG THÁI TẢI ===
  // Xác định xem có đang tải dữ liệu hay không (bao gồm cả tải lần đầu và refetch)
  const isCurrentlyLoading = isLoadingCases || isFetchingCases;
  // Kiểm tra xem có dữ liệu hợp lệ để hiển thị không
  const hasDataToShow = serviceCasesData?.data && serviceCasesData.data.length > 0;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý hồ sơ giao kết quả</Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            setPageNumber(1) // Reset về trang 1 khi thay đổi bộ lọc
          }}
          style={{ width: 250 }}
          placeholder='Chọn trạng thái'
          loading={isLoadingStatus}
          disabled={isLoadingStatus}
        >
          {(statusListData?.data || []).map((status: ServiceCaseStatus) => (
            <Select.Option key={status._id} value={status._id}>
              {status.testRequestStatus}
            </Select.Option>
          ))}
        </Select>
      </div>

      {isCurrentlyLoading ? (
        // Hiển thị Spin khi đang tải (tải lần đầu hoặc đang refetch)
        <Spin tip="Đang tải dữ liệu..." style={{ display: 'block', margin: '50px auto' }} />
      ) : (
        // Nếu không tải, kiểm tra xem có dữ liệu để hiển thị hay không
        hasDataToShow ? (
          <Table
            dataSource={serviceCasesData.data}
            columns={columns}
            rowKey='_id'
            pagination={{
              current: pageNumber,
              pageSize,
              total: serviceCasesData?.totalRecords || 0,
              onChange: (page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              },
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}

            locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
          />
        ) : (
          // Không tải và không có dữ liệu -> hiển thị Empty
          <Empty description='Không có dữ liệu' />
        )
      )}

      <Modal
        title='Xác nhận cập nhật trạng thái'
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        confirmLoading={isUpdating}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
          setNewStatusId('')
        }}
        okText='Cập nhật'
        cancelText='Hủy'
      >
        <p>
          Mã hồ sơ: <strong>{selectedServiceCase?._id}</strong>
        </p>
        <p>
          Trạng thái hiện tại:{' '}
          <Tag color='blue'>{selectedServiceCase?.currentStatus?.testRequestStatus}</Tag>
        </p>
        <p>
          Trạng thái mới:{' '}
          <Tag
            color={
              statusListData?.data?.find((s) => s._id === newStatusId)?.testRequestStatus.toLowerCase().includes('không thành') ||
              statusListData?.data?.find((s) => s._id === newStatusId)?.testRequestStatus.toLowerCase().includes('hủy')
                ? 'red'
                : 'green'
            }
          >
            {statusListData?.data?.find((s) => s._id === newStatusId)?.testRequestStatus}
          </Tag>
        </p>
      </Modal>
    </div>
  )
}

export default DeliveryStaffServiceCase