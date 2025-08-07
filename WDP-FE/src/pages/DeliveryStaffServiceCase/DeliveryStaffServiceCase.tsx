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
  Upload, // Import Upload component từ Ant Design
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  useGetAllServiceCasesForDeliveryQuery,
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
  useCreateServiceCaseImageMutation, // Import hook mới cho API upload ảnh
} from '../../features/deliveryStaff/deliveryStaff'
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  UploadOutlined, // Icon cho nút upload
} from '@ant-design/icons'
import type { UploadFile } from 'antd/lib/upload/interface'

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
  address: {
    _id: string
    fullAddress: string
    location: {
      // Thêm thông tin location vào address
      type: string
      coordinates: number[]
    }
  }
  account: {
    // Thêm thông tin account
    _id: string
    name: string
    phoneNumber: string
    email: string
  }
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const DeliveryStaffServiceCase: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>('')
  const [updateModalVisible, setUpdateModalVisible] = useState(false)

  // State cho modal upload ảnh
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingServiceCaseId, setUploadingServiceCaseId] = useState<
    string | null
  >(null)

  const {
    data: statusListData,
    isLoading: isLoadingStatus,
    isSuccess: isStatusListSuccess,
  } = useGetServiceCaseStatusListForDeliveryQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  // Đảm bảo status mặc định được set và query chính được kích hoạt
  // Check de gan mac dinh la status "Da co ket qua"
  useEffect(() => {
    if (
      isStatusListSuccess &&
      statusListData?.data?.length &&
      selectedStatus === undefined
    ) {
      const defaultStatus = statusListData.data.find(
        (s: ServiceCaseStatus) => s.testRequestStatus === 'Đã có kết quả'
      )
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
    isFetching: isFetchingCases,
    isError: isErrorCases,
    error: errorCases,
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

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateServiceCaseStatusForDeliveryMutation()
  const [createServiceCaseImage, { isLoading: isUploadingImage }] =
    useCreateServiceCaseImageMutation()

  const getAvailableNextStatuses = (statusId: string) => {
    const current = statusListData?.data?.find(
      (s: ServiceCaseStatus) => s._id === statusId
    )
    // Chỉ trả về các trạng thái có order lớn hơn trạng thái hiện tại
    return (
      statusListData?.data?.filter(
        (s: ServiceCaseStatus) => s.order > (current?.order || -1)
      ) || []
    )
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
      refetch() // Refetch dữ liệu sau khi cập nhật thành công
    } catch (error: any) {
      message.error(error?.data?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadingServiceCaseId) {
      message.error('Vui lòng chọn một file và đảm bảo có Service Case ID.')
      return
    }

    const formData = new FormData()
    formData.append('serviceCase', uploadingServiceCaseId) // Thêm serviceCaseId vào formData
    formData.append('file', selectedFile) // Thêm file ảnh vào formData

    try {
      await createServiceCaseImage(formData).unwrap()
      message.success('Tải ảnh lên thành công!')
      setUploadModalVisible(false)
      setSelectedFile(null)
      setUploadingServiceCaseId(null)
      refetch() // Refetch dữ liệu sau khi upload thành công
    } catch (error: any) {
      message.error(error?.data?.message || 'Tải ảnh lên thất bại.')
      console.error('Upload failed:', error)
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
        let color = 'default' // Mặc định
        if (record.currentStatus?.testRequestStatus === 'Đã có kết quả') {
          color = 'blue'
        } else if (
          record.currentStatus?.testRequestStatus === 'Đã trả kết quả' ||
          record.currentStatus?.testRequestStatus === 'Hoàn thành'
        ) {
          color = 'green'
        } else {
          color = 'red' // Các trạng thái còn lại là màu đỏ
        }
        return (
          <Tag color={color}>
            {record.currentStatus?.testRequestStatus || '—'}
          </Tag>
        )
      },
    },
    // --- Cột mới: Thông tin khách hàng ---
    {
      title: 'Thông tin khách hàng',
      key: 'customerInfo',
      width: 250,
      render: (_, record) => (
        <Space direction='vertical' size={2}>
          <Tooltip title={`Tên: ${record.account?.name || 'N/A'}`}>
            <div>
              <UserOutlined /> {record.account?.name || 'N/A'}
            </div>
          </Tooltip>
          <Tooltip title={`SĐT: ${record.account?.phoneNumber || 'N/A'}`}>
            <div>
              <PhoneOutlined /> {record.account?.phoneNumber || 'N/A'}
            </div>
          </Tooltip>
          {record.account?.email && (
            <Tooltip title={`Email: ${record.account.email}`}>
              <div>
                <EnvironmentOutlined /> {record.account.email}
              </div>
            </Tooltip>
          )}
        </Space>
      ),
    },
    // --- Cột mới: Địa chỉ giao hàng ---
    {
      title: 'Địa chỉ giao hàng',
      key: 'deliveryAddress',
      width: 300,
      render: (_, record) => (
        <Tooltip title={record.address?.fullAddress || 'N/A'}>
          <Space>
            <EnvironmentOutlined />
            <span>{record.address?.fullAddress || 'N/A'}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 250,
      render: (_, record) => {
        // Chỉ cho phép cập nhật nếu trạng thái hiện tại là 'Đã có kết quả'
        const isUpdatable =
          record.currentStatus?.testRequestStatus === 'Đã có kết quả'
        // Kiểm tra nếu trạng thái hiện tại KHÔNG PHẢI là 'Hoàn thành'
        const isNotCompleted =
          record.currentStatus?.testRequestStatus !== 'Hoàn thành'

        // Lấy các trạng thái tiếp theo có thể cập nhật
        const availableNextStatuses = getAvailableNextStatuses(
          record.currentStatus?._id
        )

        // Tìm trạng thái "Đã trả kết quả" (thành công)
        const successStatus = availableNextStatuses.find(
          (s) => s.testRequestStatus === 'Đã trả kết quả'
        )
        // Tìm trạng thái "Giao kết quả không thành công" hoặc "Hủy" (thất bại)
        const failureStatus = availableNextStatuses.find(
          (s) =>
            s.testRequestStatus.toLowerCase().includes('không thành công') ||
            s.testRequestStatus.toLowerCase().includes('hủy')
        )

        return (
          <Space wrap>
            {' '}
            {/* Dùng Space wrap để các nút tự xuống dòng nếu không đủ chỗ */}
            {isUpdatable && (
              <>
                {successStatus && (
                  <Button
                    key={successStatus._id}
                    onClick={() => {
                      setSelectedServiceCase(record)
                      setNewStatusId(successStatus._id)
                      setUpdateModalVisible(true)
                    }}
                    type='primary'
                  >
                    Thành công
                  </Button>
                )}
                {failureStatus && (
                  <Button
                    key={failureStatus._id}
                    onClick={() => {
                      setSelectedServiceCase(record)
                      setNewStatusId(failureStatus._id)
                      setUpdateModalVisible(true)
                    }}
                    type='primary'
                    danger // Nút thất bại thường có màu đỏ
                  >
                    Thất bại
                  </Button>
                )}
              </>
            )}
            {/* Nút Upload ảnh được thêm vào đây, hiển thị nếu trạng thái hiện tại không phải là "Hoàn thành" */}
            {isNotCompleted && (
              <Button
                key='upload-image'
                onClick={() => {
                  setUploadingServiceCaseId(record._id) // Lưu ID của service case hiện tại
                  setUploadModalVisible(true) // Mở modal upload
                }}
                icon={<UploadOutlined />}
                style={{
                  backgroundColor: '#28a745',
                  borderColor: '#28a745',
                  color: 'white',
                }} // Màu xanh lá cây
              ></Button>
            )}
            {!isUpdatable && !isNotCompleted && (
              <Tag color='default'>Không thể cập nhật</Tag>
            )}
          </Space>
        )
      },
    },
  ]

  // === LOGIC QUAN TRỌNG ĐỂ XỬ LÝ HIỂN THỊ DỮ LIỆU VÀ TRẠNG THÁI TẢI ===
  // Xác định xem có đang tải dữ liệu hay không (bao gồm cả tải lần đầu và refetch)
  const isCurrentlyLoading = isLoadingCases || isFetchingCases
  // Kiểm tra xem có dữ liệu hợp lệ để hiển thị không
  const hasDataToShow =
    serviceCasesData?.data && serviceCasesData.data.length > 0

  if (isErrorCases) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Quản lý hồ sơ đã có kết quả</Title>

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

        <Empty
          description={
            errorCases?.data?.message ||
            'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.'
          }
        />
      </div>
    )
  }
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
        <Spin
          tip='Đang tải dữ liệu...'
          style={{ display: 'block', margin: '50px auto' }}
        />
      ) : // Nếu không tải, kiểm tra xem có dữ liệu để hiển thị hay không
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
          locale={{ emptyText: <Empty description='Không có dữ liệu' /> }}
        />
      ) : (
        // Không tải và không có dữ liệu -> hiển thị Empty
        <Empty description='Không có dữ liệu' />
      )}

      {/* Modal xác nhận cập nhật trạng thái */}
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
          <Tag color='blue'>
            {selectedServiceCase?.currentStatus?.testRequestStatus}
          </Tag>
        </p>
        <p>
          Trạng thái mới:{' '}
          <Tag
            color={
              statusListData?.data
                ?.find((s) => s._id === newStatusId)
                ?.testRequestStatus.toLowerCase()
                .includes('không thành') ||
              statusListData?.data
                ?.find((s) => s._id === newStatusId)
                ?.testRequestStatus.toLowerCase()
                .includes('hủy')
                ? 'red'
                : 'green'
            }
          >
            {
              statusListData?.data?.find((s) => s._id === newStatusId)
                ?.testRequestStatus
            }
          </Tag>
        </p>
      </Modal>

      {/* Modal Upload ảnh */}
      <Modal
        title={`Upload ảnh cho hồ sơ: ${uploadingServiceCaseId ? uploadingServiceCaseId.substring(0, 8) + '...' : ''}`}
        open={uploadModalVisible}
        onOk={handleFileUpload}
        confirmLoading={isUploadingImage}
        onCancel={() => {
          setUploadModalVisible(false)
          setSelectedFile(null)
          setUploadingServiceCaseId(null)
        }}
        okText='Tải lên'
        cancelText='Hủy'
      >
        <p>Chọn ảnh bạn muốn tải lên cho hồ sơ này:</p>
        <input
          type='file'
          accept='image/*' // Chỉ cho phép chọn file ảnh
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0])
            } else {
              setSelectedFile(null)
            }
          }}
        />
        {selectedFile && (
          <p>
            Đã chọn file: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </Modal>
    </div>
  )
}

export default DeliveryStaffServiceCase
