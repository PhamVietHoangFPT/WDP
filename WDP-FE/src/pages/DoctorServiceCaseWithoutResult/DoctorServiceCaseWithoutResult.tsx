"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, Typography, Spin, Tag, Button, Select, Modal, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons"
import {
  useGetServiceCaseWithoutResultsListQuery,
  useGetAllRequestStatusListQuery,
  useUpdateServiceCaseStatusMutation,
} from "../../features/doctor/doctorAPI"

const { Title } = Typography

interface ServiceCase {
  _id: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
  caseMember: {
    testTaker: string[]
  }
  bookingDate: string
  timeReturn: number
}

interface RequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const DoctorServiceCaseWithoutResult: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [resultExists, setResultExists] = useState<boolean>(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)

  // Fetch request status list for dropdown
  const { data: statusListData, isLoading: isLoadingStatus } = useGetAllRequestStatusListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  // Fetch service cases without results
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices, // True on initial load or when cache key changes
    isFetching: isFetchingServices, // True whenever data is being fetched (initial, refetch, background)
    refetch: refetchServiceCases, // Thêm refetch để làm mới dữ liệu sau khi cập nhật
  } = useGetServiceCaseWithoutResultsListQuery(
    {
      pageNumber,
      pageSize,
      currentStatus: selectedStatus,
      resultExists,
    },
    {
      // skip: !selectedStatus, // Bỏ skip nếu muốn query ngay cả khi chưa có defaultStatus,
                             // nhưng nếu API yêu cầu currentStatus thì phải giữ.
                             // Hiện tại đang có useEffect set defaultStatus, nên giữ skip này vẫn hợp lý
                             // để tránh lỗi API nếu backend yêu cầu status.
    },
  )

  // Update service case status mutation
  const [updateServiceCaseStatus, { isLoading: isUpdating }] = useUpdateServiceCaseStatusMutation()

  // Set default status to first available status (order 7)
  useEffect(() => {
    if (statusListData?.data && !selectedStatus) {
      const defaultStatus = statusListData.data.find((status: RequestStatus) => status.order === 7)
      if (defaultStatus) {
        setSelectedStatus(defaultStatus._id)
      }
    }
  }, [statusListData, selectedStatus])

  // Calculate days left for service case
  const calculateDaysLeft = (bookingDate: string, timeReturn: number) => {
    const booking = new Date(bookingDate)
    const deadline = new Date(booking.getTime() + timeReturn * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return { days: diffDays, status: "normal", text: `Còn ${diffDays} ngày` }
    } else if (diffDays === 0) {
      return { days: 0, status: "warning", text: "Hôm nay" }
    } else {
      return { days: diffDays, status: "danger", text: `Quá hạn ${Math.abs(diffDays)} ngày` }
    }
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedServiceCase) return

    try {
      // Find next status (order 8)
      const nextStatus = statusListData?.data?.find((status: RequestStatus) => status.order === 8)
      if (!nextStatus) {
        message.error("Không tìm thấy trạng thái tiếp theo!")
        return
      }

      await updateServiceCaseStatus({
        id: selectedServiceCase._id,
        currentStatus: nextStatus._id,
      }).unwrap()

      message.success("Cập nhật trạng thái thành công!")
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      refetchServiceCases() // Rất quan trọng: làm mới dữ liệu sau khi cập nhật thành công

    } catch (error: any) {
      console.error("Update status error:", error)
      // Xử lý lỗi chi tiết hơn
      if (error.data) {
        if (error.data.statusCode === 409) {
          message.error(`Cập nhật trạng thái thất bại: ${error.data.message || "Trạng thái không hợp lệ."}`);
        } else if (error.data.message) {
          message.error(`Cập nhật trạng thái thất bại: ${error.data.message}`);
        } else {
          message.error(`Cập nhật trạng thái thất bại: Lỗi không xác định từ máy chủ (${error.status || "Không rõ"}).`);
        }
      } else if (error.status) {
          message.error(`Cập nhật trạng thái thất bại: Lỗi máy chủ ${error.status} - ${error.statusText || "Lỗi không xác định"}.`);
      } else {
        message.error("Cập nhật trạng thái thất bại: Không thể kết nối đến máy chủ hoặc lỗi không xác định.");
      }
      refetchServiceCases() // Rất quan trọng: làm mới dữ liệu sau khi cập nhật thất bại (để UI khớp BE)
    }
  }

  // Handle create result (placeholder)
  const handleCreateResult = (serviceCaseId: string) => {
    console.log("Create result for:", serviceCaseId)
    message.info("Chức năng tạo kết quả đang được phát triển")
    // TODO: Navigate to create result page or open modal
  }

  // Handle view details (placeholder for future implementation)
  const handleViewDetails = (serviceCaseId: string) => {
    console.log("View details for:", serviceCaseId)
    // TODO: Navigate to service case details page or open modal
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Mã dịch vụ",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "bold" }}>{id}</div>,
    },
    {
      title: "Trạng thái hiện tại",
      key: "currentStatus",
      render: (_, record) => {
        const color = record.currentStatus.order === 7 ? "blue" : "orange"
        return <Tag color={color}>{record.currentStatus.testRequestStatus}</Tag>
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: "Thời gian xử lý",
      key: "timeReturn",
      render: (_, record) => {
        const daysInfo = calculateDaysLeft(record.bookingDate, record.timeReturn)
        const color = daysInfo.status === "danger" ? "#ff4d4f" : daysInfo.status === "warning" ? "#faad14" : "#52c41a"

        return (
          <div>
            <div style={{ fontWeight: "bold" }}>{record.timeReturn} ngày</div>
            <div style={{ fontSize: "12px", color }}>{daysInfo.text}</div>
          </div>
        )
      },
      sorter: (a, b) => {
        const aDays = calculateDaysLeft(a.bookingDate, a.timeReturn).days
        const bDays = calculateDaysLeft(b.bookingDate, b.timeReturn).days
        return aDays - bDays
      },
    },
    {
      title: "Người thực hiện",
      key: "testTaker",
      render: (_, record) => (
        <div>
          {record.caseMember.testTaker.map((takerId, index) => (
            <div key={takerId} style={{ fontSize: "12px", fontFamily: "monospace" }}>
              {takerId.slice(-8).toUpperCase()}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        if (record.currentStatus.order === 7) {
          return (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedServiceCase(record)
                setUpdateModalVisible(true)
              }}
              size="small"
            >
              Cập nhật trạng thái
            </Button>
          )
        } else if (record.currentStatus.order === 8) {
          return (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateResult(record._id)}
              size="small"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Tạo kết quả
            </Button>
          )
        } else {
          return (
            <Button type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record._id)} size="small">
              Xem chi tiết
            </Button>
          )
        }
      },
    },
  ]

  // Get data from API response. Nếu đang fetching thì dùng mảng rỗng để không hiển thị data cũ.
  // Điều này đảm bảo khi filter, bảng sẽ trống trong lúc fetch data mới.
  const serviceCases = isFetchingServices ? [] : (serviceCasesData?.data || []);
  const totalItems = isFetchingServices ? 0 : (serviceCasesData?.data?.length || 0);


  // Get current status name for display
  const currentStatusName =
    statusListData?.data?.find((status: RequestStatus) => status._id === selectedStatus)?.testRequestStatus || ""

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ chưa có kết quả</Title>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Trạng thái:</span>
            <Select
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value)
                setPageNumber(1)
              }}
              style={{ width: 200 }}
              placeholder="Chọn trạng thái"
              loading={isLoadingStatus}
              disabled={isLoadingStatus}
            >
              {statusListData?.data
                ?.filter((status: RequestStatus) => status.order >= 7 && status.order <= 8)
                ?.sort((a: RequestStatus, b: RequestStatus) => a.order - b.order)
                ?.map((status: RequestStatus) => (
                  <Select.Option key={status._id} value={status._id}>
                    {status.testRequestStatus}
                  </Select.Option>
                ))}
            </Select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Có kết quả:</span>
            <Select
              value={resultExists}
              onChange={(value) => {
                setResultExists(value)
                setPageNumber(1)
              }}
              style={{ width: 120 }}
            >
              <Select.Option value={false}>Chưa có</Select.Option>
              <Select.Option value={true}>Đã có</Select.Option>
            </Select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedStatus && (
            <Tag color={currentStatusName === "Đang phân tích" ? "blue" : "orange"}>
              {currentStatusName}: {totalItems} dịch vụ
            </Tag>
          )}
          {/* Không cần hiển thị "(Không có dữ liệu)" ở đây nữa, vì nó được xử lý ở phần render chính bên dưới */}
        </div>
      </div>

      {/* Logic hiển thị các trạng thái của bảng */}
      {!selectedStatus ? (
        // Case 1: Chưa chọn trạng thái
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
            Vui lòng chọn trạng thái để xem danh sách dịch vụ
          </div>
        </div>
      ) : isFetchingServices && serviceCases.length === 0 && (serviceCasesData === undefined) ? (
        // Case 2: Đang tải dữ liệu lần đầu hoặc sau khi filter mà chưa có data nào được load
        // Dùng serviceCasesData === undefined để kiểm tra nếu đây là lần đầu tiên fetch
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 20, color: "#666" }}>Đang tải dữ liệu...</div>
        </div>
      ) : totalItems === 0 && !isFetchingServices ? ( // Đã xong fetch VÀ không có dữ liệu
        // Case 3: Đã tải xong nhưng không có dữ liệu khớp với bộ lọc
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "18px", color: "#666", marginBottom: "16px" }}>📋 Không có dữ liệu</div>
          <div style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}>
            Không tìm thấy dịch vụ nào với bộ lọc hiện tại:
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "12px 16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <strong>Trạng thái:</strong>{" "}
              <Tag color={currentStatusName === "Đang phân tích" ? "blue" : "orange"}>{currentStatusName}</Tag>
            </div>
            <div>
              <strong>Có kết quả:</strong>{" "}
              <Tag color={resultExists ? "green" : "red"}>{resultExists ? "Đã có" : "Chưa có"}</Tag>
            </div>
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>Thử thay đổi bộ lọc để xem các dịch vụ khác</div>
        </div>
      ) : (
        // Case 4: Có dữ liệu để hiển thị hoặc đang fetching nhưng vẫn có dữ liệu cũ
        <>
          <Table
            dataSource={serviceCases} // `serviceCases` giờ đây sẽ là mảng rỗng khi đang fetching
            columns={columns}
            rowKey="_id"
            pagination={{
              current: pageNumber,
              pageSize: pageSize,
              total: totalItems, // `totalItems` giờ đây sẽ là 0 khi đang fetching
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ`,
              onChange: (page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              },
            }}
            loading={isFetchingServices} // Giữ loading trên Table để có spin nhỏ hơn và không ẩn bảng
            locale={{
              emptyText: `Không có dịch vụ nào với trạng thái "${currentStatusName}"`, // Cái này giờ sẽ chỉ hiển thị khi `isFetchingServices` là false và `dataSource` rỗng
            }}
            scroll={{ x: 1000 }}
          />
        </>
      )}

      {/* Confirmation Modal */}
      <Modal
        title="⚠️ Xác nhận cập nhật trạng thái"
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
        }}
        confirmLoading={isUpdating}
        okText="Xác nhận cập nhật"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div style={{ padding: "16px 0" }}>
          <p>
            <strong>Mã dịch vụ:</strong> {selectedServiceCase?._id}
          </p>
          <p>
            <strong>Trạng thái hiện tại:</strong>{" "}
            <Tag color="blue">{selectedServiceCase?.currentStatus.testRequestStatus}</Tag>
          </p>
          <p>
            <strong>Trạng thái mới:</strong> <Tag color="orange">Chờ duyệt kết quả</Tag>
          </p>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "6px",
            }}
          >
            <div style={{ color: "#cf1322", fontWeight: "bold", marginBottom: "8px" }}>🚨 CẢNH BÁO QUAN TRỌNG</div>
            <div style={{ color: "#cf1322", lineHeight: "1.6" }}>
              Bạn có muốn xác nhận cập nhật trạng thái? Mọi hoạt động không thể hoàn tác và nếu có sai sót, bạn sẽ chịu
              trách nhiệm trước pháp luật. Vui lòng kiểm tra kỹ trước khi xác nhận.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DoctorServiceCaseWithoutResult