"use client"
import type React from "react"
import { useState, useEffect } from "react"
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
  Input, // Thêm Input để nhập email
  Upload,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  // Thay đổi import từ deliveryStaff sang staff API nếu cần, hoặc đảm bảo deliveryStaff API có đủ hook
  // Tuy nhiên, theo API bạn cung cấp, useGetServiceCaseByEmailForStaffQuery nằm trong deliveryAPI
  // nên không cần thay đổi import, chỉ cần thêm hook mới vào.
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
  useGetServiceCaseByEmailForStaffQuery, // Import hook mới
  useCreateServiceCaseImageMutation, // Import hook upload ảnh
} from "../../features/deliveryStaff/deliveryStaff" // Giữ nguyên path vì API mới được inject vào đây
import { UploadOutlined } from "@ant-design/icons"

const { Title } = Typography

// Cập nhật interface ServiceCase để khớp với response từ getServiceCaseByEmailForStaff
// Data trả về ít trường hơn
interface ServiceCase {
  _id: string
  created_at: string
  currentStatus: string // currentStatus giờ là string thay vì object
  bookingDate: string
  // Bỏ các trường address, account, caseMember vì chúng không có trong response của getServiceCaseByEmailForStaff
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const ReturnFail: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [customerEmail, setCustomerEmail] = useState<string>("") // State mới cho email khách hàng
  const [pageNumber, setPageNumber] = useState<number>(1) // PageNumber và PageSize có thể không cần thiết nếu API staff không hỗ trợ phân trang
  const [pageSize, setPageSize] = useState<number>(10) // Tùy thuộc vào API getServiceCaseByEmailForStaff có hỗ trợ hay không
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>("")
  const [updateModalVisible, setUpdateModalVisible] = useState(false)

  const {
    data: statusListData,
    isLoading: isLoadingStatus,
    isSuccess: isStatusListSuccess,
  } = useGetServiceCaseStatusListForDeliveryQuery({ pageNumber: 1, pageSize: 100 })

  // Đảm bảo status mặc định là "Giao kết quả không thành công"
  useEffect(() => {
    if (isStatusListSuccess && statusListData?.data?.length && selectedStatus === undefined) {
      const defaultFailStatus = statusListData.data.find(
        (s: ServiceCaseStatus) => s.testRequestStatus === "Giao kết quả không thành công",
      )
      if (defaultFailStatus) {
        setSelectedStatus(defaultFailStatus._id)
      } else if (statusListData.data.length > 0) {
        // Fallback: nếu không tìm thấy, chọn cái đầu tiên (có thể không mong muốn)
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
    // Sử dụng hook mới
    {
      serviceCaseStatus: selectedStatus as string, // Đảm bảo selectedStatus có giá trị
      email: customerEmail, // Truyền email vào query
    },
    // Bỏ qua query nếu chưa có trạng thái được chọn HOẶC chưa có email
    { skip: selectedStatus === undefined || !customerEmail },
  )

  // Gọi refetch khi selectedStatus hoặc customerEmail thay đổi
  useEffect(() => {
    if (selectedStatus !== undefined && customerEmail) {
      // Chỉ refetch khi có đủ cả status và email
      refetch()
    }
  }, [selectedStatus, customerEmail, refetch])

  const [updateStatus, { isLoading: isUpdating }] = useUpdateServiceCaseStatusForDeliveryMutation()

  // Create service case image mutation
  const [createServiceCaseImage, { isLoading: isUploading }] = useCreateServiceCaseImageMutation()

  const getAvailableNextStatuses = (currentStatusString: string) => {
    // Tìm ID của trạng thái "Đã trả kết quả"
    const deliveredStatus = statusListData?.data?.find(
      (s: ServiceCaseStatus) => s.testRequestStatus === "Đã trả kết quả",
    )
    // Nếu trạng thái hiện tại là "Giao kết quả không thành công" và có trạng thái "Đã trả kết quả"
    if (currentStatusString === "Giao kết quả không thành công" && deliveredStatus) {
      return [deliveredStatus]
    }
    return []
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return
    try {
      await updateStatus({ id: selectedServiceCase._id, currentStatus: newStatusId }).unwrap()
      message.success("Cập nhật trạng thái thành công")
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      setNewStatusId("")
      refetch() // Refetch dữ liệu sau khi cập nhật thành công
    } catch (error: any) {
      message.error(error?.data?.message || "Cập nhật trạng thái thất bại")
    }
  }

  // Handle image upload
  const handleImageUpload = async (file: File, serviceCase: ServiceCase) => {
    const formData = new FormData()
    formData.append("serviceCase", serviceCase._id)
    formData.append("file", file)

    try {
      await createServiceCaseImage(formData).unwrap()
      message.success("Upload ảnh thành công!")
    } catch (error: any) {
      console.error("Upload image error:", error)
      message.error(error?.data?.message || "Upload ảnh thất bại!")
    }
  }

  // Cập nhật Columns để phù hợp với dữ liệu trả về từ API getServiceCaseByEmailForStaff
  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Mã hồ sơ",
      dataIndex: "_id",
      key: "_id",
      width: 150,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái hiện tại",
      key: "currentStatus",
      width: 200,
      // currentStatus trong response của staff là string, không phải object
      render: (_, record) => {
        let color = "default" // Mặc định
        if (record.currentStatus === "Đã có kết quả") {
          color = "blue"
        } else if (record.currentStatus === "Đã trả kết quả") {
          color = "green"
        } else {
          color = "red" // Các trạng thái còn lại là màu đỏ
        }
        return <Tag color={color}>{record.currentStatus || "—"}</Tag>
      },
    },
    // Bỏ cột "Thông tin khách hàng" và "Địa chỉ giao hàng" vì API staff không trả về
    // Nếu muốn hiển thị, cần lấy thông tin này từ một nguồn khác hoặc API staff cần trả về.
    {
      title: "Hành động",
      key: "actions",
      width: 250,
      render: (_, record) => {
        // Lấy trạng thái "Đã trả kết quả" từ danh sách trạng thái đầy đủ
        const deliveredStatus = statusListData?.data?.find(
          (s: ServiceCaseStatus) => s.testRequestStatus === "Đã trả kết quả",
        )
        // Chỉ cho phép cập nhật nếu trạng thái hiện tại là "Giao kết quả không thành công"
        // và tìm thấy trạng thái "Đã trả kết quả"
        const isUpdatable = record.currentStatus === "Giao kết quả không thành công" && deliveredStatus

        if (!isUpdatable) {
          return (
            <Space direction="vertical" size="small">
              <Tag color="default">Không thể cập nhật</Tag>
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file, record)
                  return false // Prevent default upload behavior
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={isUploading} size="small">
                  Upload ảnh
                </Button>
              </Upload>
            </Space>
          )
        }

        return (
          <Space direction="vertical" size="small">
            {/* Chỉ hiển thị nút "Đã trả kết quả" nếu đủ điều kiện */}
            {deliveredStatus && (
              <Button
                key={deliveredStatus._id}
                onClick={() => {
                  setSelectedServiceCase(record)
                  setNewStatusId(deliveredStatus._id) // Set newStatusId là ID của "Đã trả kết quả"
                  setUpdateModalVisible(true)
                }}
                type="primary"
                // Danger không áp dụng ở đây vì đây là trạng thái thành công
              >
                Đã trả kết quả
              </Button>
            )}
            <Upload
              beforeUpload={(file) => {
                handleImageUpload(file, record)
                return false // Prevent default upload behavior
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={isUploading} size="small">
                Upload ảnh
              </Button>
            </Upload>
          </Space>
        )
      },
    },
  ]

  // === LOGIC QUAN TRỌNG ĐỂ XỬ LÝ HIỂN THỊ DỮ LIỆU VÀ TRẠNG THÁI TẢI ===
  // Xác định xem có đang tải dữ liệu hay không (bao gồm cả tải lần đầu và refetch)
  const isCurrentlyLoading = isLoadingCases || isFetchingCases
  // Kiểm tra xem có dữ liệu hợp lệ để hiển thị không
  const hasDataToShow = serviceCasesData?.data && serviceCasesData.data.length > 0

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý hồ sơ giao kết quả không thành công (Staff)</Title>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Nhập Email khách hàng"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        {/* Giữ Select Status nhưng giá trị mặc định sẽ là "Giao kết quả không thành công" */}
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            setPageNumber(1) // Reset về trang 1 khi thay đổi bộ lọc
          }}
          style={{ width: 250 }}
          placeholder="Chọn trạng thái"
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
        <Spin tip="Đang tải dữ liệu..." style={{ display: "block", margin: "50px auto" }} />
      ) : // Nếu không tải, kiểm tra xem có dữ liệu để hiển thị hay không
      hasDataToShow ? (
        <Table
          dataSource={serviceCasesData.data}
          columns={columns}
          rowKey="_id"
          // Pagination có thể không cần thiết hoặc cần điều chỉnh nếu API staff không trả về totalRecords
          pagination={{
            current: pageNumber,
            pageSize,
            // serviceCasesData?.totalRecords || 0, // Comment out hoặc điều chỉnh nếu API staff không có totalRecords
            onChange: (page, size) => {
              setPageNumber(page)
              setPageSize(size || 10)
            },
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
        />
      ) : (
        // Không tải và không có dữ liệu -> hiển thị Empty
        <Empty description="Không có dữ liệu" />
      )}

      <Modal
        title="Xác nhận cập nhật trạng thái"
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        confirmLoading={isUpdating}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
          setNewStatusId("")
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <p>
          Mã hồ sơ: <strong>{selectedServiceCase?._id}</strong>
        </p>
        <p>
          Trạng thái hiện tại: {/* selectedServiceCase?.currentStatus giờ là string */}
          <Tag color="red">{selectedServiceCase?.currentStatus}</Tag>
        </p>
        <p>
          Trạng thái mới:{" "}
          <Tag
            color={"green"} // Luôn là màu xanh vì chỉ chuyển sang "Đã trả kết quả"
          >
            {statusListData?.data?.find((s) => s._id === newStatusId)?.testRequestStatus}
          </Tag>
        </p>
      </Modal>
    </div>
  )
}

export default ReturnFail
