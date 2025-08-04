'use client'
import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Table,
  Typography,
  Spin,
  Select,
  Tag,
  Button,
  Modal,
  message,
  Space,
  Tooltip,
  Empty,
  Input,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
  useGetServiceCaseByEmailForStaffQuery,
  useCreateServiceCaseImageMutation,
} from '../../features/deliveryStaff/deliveryStaff'
import { UploadOutlined } from '@ant-design/icons'

const { Title } = Typography

interface ServiceCase {
  _id: string
  created_at: string
  currentStatus: string
  bookingDate: string
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

// Custom hook for debouncing a value
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ReturnFail: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>('')
  const [updateModalVisible, setUpdateModalVisible] = useState(false)

  // Sử dụng hook debounce cho customerEmail
  const debouncedEmail = useDebounce(customerEmail, 900) 

  const {
    data: statusListData,
    isLoading: isLoadingStatus,
    isSuccess: isStatusListSuccess,
  } = useGetServiceCaseStatusListForDeliveryQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  useEffect(() => {
    if (
      isStatusListSuccess &&
      statusListData?.data?.length &&
      selectedStatus === undefined
    ) {
      const defaultFailStatus = statusListData.data.find(
        (s: ServiceCaseStatus) =>
          s.testRequestStatus === 'Giao kết quả không thành công'
      )
      if (defaultFailStatus) {
        setSelectedStatus(defaultFailStatus._id)
      } else if (statusListData.data.length > 0) {
        setSelectedStatus(statusListData.data[0]._id)
      }
    }
  }, [statusListData, isStatusListSuccess, selectedStatus])

  const {
    data: serviceCasesData,
    isLoading: isLoadingCases,
    isFetching: isFetchingCases,
    refetch,
  } = useGetServiceCaseByEmailForStaffQuery(
    {
      serviceCaseStatus: selectedStatus as string,
      email: debouncedEmail, // Sử dụng email đã được debounce
    },
    { skip: selectedStatus === undefined || !debouncedEmail }
  )

  useEffect(() => {
    // Chỉ refetch khi debouncedEmail thay đổi
    if (selectedStatus !== undefined && debouncedEmail) {
      refetch()
    }
  }, [selectedStatus, debouncedEmail, refetch])

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateServiceCaseStatusForDeliveryMutation()

  const [createServiceCaseImage, { isLoading: isUploading }] =
    useCreateServiceCaseImageMutation()

  const getAvailableNextStatuses = (currentStatusString: string) => {
    const deliveredStatus = statusListData?.data?.find(
      (s: ServiceCaseStatus) => s.testRequestStatus === 'Đã trả kết quả'
    )
    if (
      currentStatusString === 'Giao kết quả không thành công' &&
      deliveredStatus
    ) {
      return [deliveredStatus]
    }
    return []
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return
    try {
      await updateStatus({
        id: selectedServiceCase._id,
        currentStatus: newStatusId,
      }).unwrap()
      message.success('Cập nhật trạng thái thành công')
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      setNewStatusId('')
      refetch()
    } catch (error: any) {
      message.error(error?.data?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const handleImageUpload = async (file: File, serviceCase: ServiceCase) => {
    const formData = new FormData()
    formData.append('serviceCase', serviceCase._id)
    formData.append('file', file)

    try {
      await createServiceCaseImage(formData).unwrap()
      message.success('Upload ảnh thành công!')
    } catch (error: any) {
      console.error('Upload image error:', error)
      message.error(error?.data?.message || 'Upload ảnh thất bại!')
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
        let color = 'default'
        if (record.currentStatus === 'Đã có kết quả') {
          color = 'blue'
        } else if (record.currentStatus === 'Đã trả kết quả') {
          color = 'green'
        } else {
          color = 'red'
        }
        return <Tag color={color}>{record.currentStatus || '—'}</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => {
        const deliveredStatus = statusListData?.data?.find(
          (s: ServiceCaseStatus) => s.testRequestStatus === 'Đã trả kết quả'
        )
        const isUpdatable =
          record.currentStatus === 'Giao kết quả không thành công' &&
          deliveredStatus

        if (!isUpdatable) {
          return (
            <Space direction='vertical' size='small'>
              <Tag color='default'>Không thể cập nhật</Tag>
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file, record)
                  return false
                }}
                showUploadList={false}
                accept='image/*'
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={isUploading}
                  size='small'
                >
                  Upload ảnh
                </Button>
              </Upload>
            </Space>
          )
        }

        return (
          <Space direction='vertical' size='small'>
            {deliveredStatus && (
              <Button
                key={deliveredStatus._id}
                onClick={() => {
                  setSelectedServiceCase(record)
                  setNewStatusId(deliveredStatus._id)
                  setUpdateModalVisible(true)
                }}
                type='primary'
              >
                Đã trả kết quả
              </Button>
            )}
            <Upload
              beforeUpload={(file) => {
                handleImageUpload(file, record)
                return false
              }}
              showUploadList={false}
              accept='image/*'
            >
              <Button
                icon={<UploadOutlined />}
                loading={isUploading}
                size='small'
              >
                Upload ảnh
              </Button>
            </Upload>
          </Space>
        )
      },
    },
  ]

  const isCurrentlyLoading = isLoadingCases || isFetchingCases
  const hasDataToShow =
    serviceCasesData?.data && serviceCasesData.data.length > 0

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        Quản lý hồ sơ khách hàng
      </Title>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder='Nhập Email khách hàng'
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            setPageNumber(1)
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
        <Spin
          tip='Đang tải dữ liệu...'
          style={{ display: 'block', margin: '50px auto' }}
        />
      ) : hasDataToShow ? (
        <Table
          dataSource={serviceCasesData.data}
          columns={columns}
          rowKey='_id'
          pagination={{
            current: pageNumber,
            pageSize,
            // serviceCasesData?.totalRecords || 0,
            onChange: (page, size) => {
              setPageNumber(page)
              setPageSize(size || 10)
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        />
      ) : (
        <Empty description='Không có dữ liệu' />
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
          <Tag color='red'>{selectedServiceCase?.currentStatus}</Tag>
        </p>
        <p>
          Trạng thái mới:{' '}
          <Tag
            color={'green'}
          >
            {
              statusListData?.data?.find((s) => s._id === newStatusId)
                ?.testRequestStatus
            }
          </Tag>
        </p>
      </Modal>
    </div>
  )
}

export default ReturnFail