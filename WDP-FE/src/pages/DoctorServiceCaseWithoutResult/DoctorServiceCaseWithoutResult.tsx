"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, Typography, Tag, Button, Select, Modal, message, Alert, Spin } from "antd" // Thêm Spin
import type { ColumnsType } from "antd/es/table"
import { EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons"
import {
  useGetServiceCaseWithoutResultsListQuery,
  useGetAllRequestStatusListQuery,
  useUpdateServiceCaseStatusMutation,
  useGetTestTakerQuery, // Import hook mới từ doctorAPI
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
    testTaker: string[] // Mảng các ID của testTaker
  }
  bookingDate: string
  timeReturn: number
}

interface RequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

// Định nghĩa interface cho TestTaker (dựa trên response của API)
interface TestTaker {
  _id: string;
  name: string;
  personalId: string;
  dateOfBirth: string;
  account: {
    _id: string;
    name: string;
    email: string;
  };
  gender: boolean;
}

// Component con để fetch và hiển thị tên TestTaker
interface TestTakerNameProps {
  id: string;
}

const TestTakerName: React.FC<TestTakerNameProps> = ({ id }) => {
  // Bỏ qua query nếu id không hợp lệ hoặc rỗng, mặc dù trong trường hợp này id luôn có.
  // Tuy nhiên, thêm kiểm tra này là một best practice.
  const { data: testTaker, isLoading, error } = useGetTestTakerQuery(id, {
    skip: !id, // Bỏ qua nếu id rỗng hoặc undefined
  });

  if (isLoading) {
    return <Spin size="small" />; // Hiển thị spinner nhỏ khi đang tải tên
  }

  if (error) {
    // console.error("Error fetching test taker:", error); // Có thể log lỗi ra console để debug
    return <span style={{ color: '#ff4d4f' }}>{id.slice(-8).toUpperCase()} (Lỗi tải tên)</span>; // Hiển thị ID và thông báo lỗi
  }

  // testTaker giờ đây là object TestTaker trực tiếp nhờ transformResponse
  return <span>{testTaker?.name || id.slice(-8).toUpperCase()}</span>; // Hiển thị tên, nếu không có tên thì fallback về ID
};


const DoctorServiceCaseWithoutResult: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [resultExists, setResultExists] = useState<boolean>(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)

  const { data: statusListData, isLoading: isLoadingStatus } = useGetAllRequestStatusListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  const {
    data: serviceCasesData,
    error: fetchError,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    refetch: refetchServiceCases,
  } = useGetServiceCaseWithoutResultsListQuery(
    {
      pageNumber,
      pageSize,
      currentStatus: selectedStatus,
      resultExists,
    },
    {
      skip: !selectedStatus,
    },
  )

  const [updateServiceCaseStatus, { isLoading: isUpdating }] = useUpdateServiceCaseStatusMutation()


  useEffect(() => {
    // Set default status to first available status (order 7)
    if (statusListData?.data && !selectedStatus) {
      const defaultStatus = statusListData.data.find((status: RequestStatus) => status.order === 7)
      if (defaultStatus) setSelectedStatus(defaultStatus._id)
    }
  }, [statusListData, selectedStatus])


  const calculateDaysLeft = (bookingDate: string, timeReturn: number) => {
    const booking = new Date(bookingDate);
    const deadline = new Date(booking.getTime() + timeReturn * 24 * 60 * 60 * 1000);

    const now = new Date();

    const utcNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const utcDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

    const diffTime = utcDeadline.getTime() - utcNow.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return { days: diffDays, status: "normal", text: `Còn ${diffDays} ngày` };
    if (diffDays === 0) return { days: 0, status: "warning", text: "Hôm nay" };
    return { days: diffDays, status: "danger", text: `Quá hạn ${Math.abs(diffDays)} ngày` };
  };

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase) return
    try {
      const nextStatus = statusListData?.data?.find((status: RequestStatus) => status.order === 8)
      if (!nextStatus) return message.error("Không tìm thấy trạng thái tiếp theo!")

      await updateServiceCaseStatus({
        id: selectedServiceCase._id,
        currentStatus: nextStatus._id,
      }).unwrap()

      message.success("Cập nhật trạng thái thành công!")
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      refetchServiceCases()
    } catch (error: any) {
      console.error("Update status error:", error)
      message.error(
        error?.data?.message || error?.statusText || "Không thể kết nối đến máy chủ"
      )
      refetchServiceCases()
    }
  }

  const handleCreateResult = (id: string) => {
    message.info("Chức năng đang được phát triển")
  }

  const handleViewDetails = (id: string) => {
    message.info("Xem chi tiết: " + id)
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Mã dịch vụ",
      dataIndex: "_id",
      render: (id) => <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>{id}</div>,
    },
    {
      title: "Trạng thái hiện tại",
      key: "currentStatus",
      render: (_, record) => (
        <Tag color={record.currentStatus.order === 7 ? "blue" : "orange"}>
          {record.currentStatus.testRequestStatus}
        </Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
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
            <div style={{ fontSize: 12, color }}>{daysInfo.text}</div>
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
      title: "Người xét nghiệm",
      key: "testTaker",
      render: (_, record) => (
        <div>
          {/* Mapping qua mảng testTaker IDs và render component TestTakerName cho mỗi ID */}
          {record.caseMember.testTaker.map((takerId) => (
            <div key={takerId} style={{ fontSize: 12 }}>
              <TestTakerName id={takerId} />
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
              Cập nhật
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
              Chi tiết
            </Button>
          )
        }
      },
    },
  ]

  const serviceCases = serviceCasesData?.data || []
  const totalItems = serviceCases.length

  const currentStatusName =
    statusListData?.data?.find((s) => s._id === selectedStatus)?.testRequestStatus || ""

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ chưa có kết quả</Title>

      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
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
            ?.filter((s) => s.order >= 7 && s.order <= 8)
            ?.map((s) => (
              <Select.Option key={s._id} value={s._id}>
                {s.testRequestStatus}
              </Select.Option>
            ))}
        </Select>

        <Select
          value={resultExists}
          onChange={(v) => {
            setResultExists(v)
            setPageNumber(1)
          }}
          style={{ width: 120 }}
        >
          <Select.Option value={false}>Chưa có</Select.Option>
          <Select.Option value={true}>Đã có</Select.Option>
        </Select>
      </div>

      {fetchError && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={
            `Đã xảy ra lỗi khi tải dữ liệu: ${(fetchError as any)?.status || "Không xác định"} - ${
              (fetchError as any)?.data?.message || (fetchError as any)?.error || "Vui lòng thử lại sau."
            }`
          }
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={refetchServiceCases}>
              Tải lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {!selectedStatus && (
        <Alert
          message="Vui lòng chọn trạng thái"
          description="Hãy chọn một trạng thái từ danh sách trên để hiển thị dữ liệu."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ minHeight: '400px' }}>
        <Table
          dataSource={serviceCases}
          columns={columns}
          rowKey="_id"
          pagination={{
            current: pageNumber,
            pageSize,
            total: totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `${total} dịch vụ`,
            onChange: (page, size) => {
              setPageNumber(page)
              setPageSize(size || 10)
            },
          }}
          loading={isFetchingServices}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '18px', color: '#999', marginBottom: '8px' }}>
                  Không có dữ liệu
                </div>
                <div style={{ fontSize: '14px', color: '#aaa' }}>
                  Không tìm thấy dịch vụ nào phù hợp với bộ lọc hiện tại.
                </div>
              </div>
            ),
          }}
        />
      </div>

      <Modal
        title="⚠️ Xác nhận cập nhật trạng thái"
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
        }}
        confirmLoading={isUpdating}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p><strong>Mã dịch vụ:</strong> {selectedServiceCase?._id}</p>
        <p><strong>Trạng thái hiện tại:</strong> <Tag color="blue">{selectedServiceCase?.currentStatus.testRequestStatus}</Tag></p>
        <p><strong>Trạng thái mới:</strong> <Tag color="orange">Chờ duyệt kết quả</Tag></p>
        <div style={{ marginTop: 20, background: "#fff1f0", padding: 12, border: "1px solid #ffa39e", borderRadius: 6 }}>
          <strong style={{ color: "#cf1322" }}>Lưu ý:</strong> Hãy đảm bảo trạng thái cập nhật đúng. Hành động này không thể hoàn tác và bạn sẽ chịu trách nhiệm theo đúng pháp luật
        </div>
      </Modal>
    </div>
  )
}

export default DoctorServiceCaseWithoutResult