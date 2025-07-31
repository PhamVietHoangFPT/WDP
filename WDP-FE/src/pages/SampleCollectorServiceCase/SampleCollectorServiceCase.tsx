"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Table,
  Typography,
  Spin,
  Pagination,
  Select,
  Tag,
  Button,
  Dropdown,
  Menu,
  Modal,
  message,
  Space,
  Tooltip,
  Upload,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  useGetServiceCaseStatusListQuery,
  useGetAllServiceCasesQuery,
  useUpdateServiceCaseStatusMutation,
} from "../../features/sampleCollector/sampleCollectorAPI"
import { useCreateServiceCaseImageMutation } from "../../features/deliveryStaff/deliveryStaff"
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, CarOutlined, UploadOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

interface ServiceCase {
  _id: string
  statusDetails: string
  bookingDate: string
  currentStatus?: string
  caseMember: {
    testTakers: {
      _id: string
      name: string
      personalId: string
    }[]
    sampleIdentifyNumbers: string[]
    isSelfSampling: boolean
  }
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const SampleCollectorServiceCase: React.FC = () => {
  const [isAtHome, setIsAtHome] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>("")

  // Fetch du lieu cho dropdown status
  const { data: statusListData, isLoading: isLoadingStatus } = useGetServiceCaseStatusListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  // Fetch service cases theo status
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetAllServiceCasesQuery(
    { serviceCaseStatus: selectedStatus || "", isAtHome: isAtHome },
    {
      skip: !selectedStatus,
    },
  )

  const [updateServiceCaseStatus, { isLoading: isUpdating }] = useUpdateServiceCaseStatusMutation()

  const [createServiceCaseImage, { isLoading: isUploading }] = useCreateServiceCaseImageMutation()

  useEffect(() => {
    setPageNumber(1)
  }, [selectedStatus])

  // Mau sac cho cac status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "orange"
      case "Đang lấy mẫu":
        return "blue"
      case "Đã nhận mẫu":
        return "green"
      case "Check-in":
        return "purple"
      case "Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)":
        return "cyan"
      default:
        return "default"
    }
  }

  // Get order hien tai cua status
  const getCurrentStatusOrder = (statusName: string) => {
    const status = statusListData?.data?.find((s: ServiceCaseStatus) => s.testRequestStatus === statusName)
    return status?.order || 0
  }

  // Get nhung status tiep theo co the cap nhat duoc
  const getAvailableNextStatuses = (currentStatusName: string) => {
    const currentOrder = getCurrentStatusOrder(currentStatusName)
    return [...(statusListData?.data || [])]
      .filter((status: ServiceCaseStatus) => status.order > currentOrder)
      .sort((a: ServiceCaseStatus, b: ServiceCaseStatus) => a.order - b.order)
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return

    try {
      await updateServiceCaseStatus({
        id: selectedServiceCase._id,
        currentStatus: newStatusId,
      }).unwrap()
      message.success("Cập nhật trạng thái thành công!")
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      setNewStatusId("")
    } catch (error: any) {
      console.error("Update status error:", error)
      message.error(error?.data?.message || "Cập nhật trạng thái thất bại!")
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

  // Get status update menu
  const getStatusUpdateMenu = (record: ServiceCase) => {
    const availableStatuses = getAvailableNextStatuses(record.statusDetails)
    if (availableStatuses.length === 0) {
      return (
        <Menu
          items={[
            {
              key: "no-update",
              label: <span style={{ color: "#999" }}>Không thể cập nhật thêm</span>,
              disabled: true,
            },
          ]}
        />
      )
    }

    return (
      <Menu
        items={availableStatuses.map((status: ServiceCaseStatus) => ({
          key: status._id,
          label: (
            <div
              onClick={() => {
                setSelectedServiceCase(record)
                setNewStatusId(status._id)
                setUpdateModalVisible(true)
              }}
            >
              {status.testRequestStatus}
            </div>
          ),
        }))}
      />
    )
  }

  const customerCollumns = {
    title: "Thông tin Khách hàng",
    key: "customerInfo",
    dataIndex: ["accountDetails", "name"],
    render: (_, record) => {
      const account = record.accountDetails
      if (!account) {
        return "—"
      }
      const fullAddress = account.address?.fullAddress
      const coordinates = account.address?.location?.coordinates
      const canNavigate = fullAddress && coordinates

      const handleDirectionsClick = () => {
        if (!canNavigate) return
        const encodedAddress = encodeURIComponent(fullAddress)
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
        window.open(mapsUrl, "_blank", "noopener,noreferrer")
      }

      return (
        <Space direction="vertical" size={4}>
          <Space>
            <UserOutlined />
            <Typography.Text strong>{account.name}</Typography.Text>
          </Space>
          <Space>
            <PhoneOutlined />
            <Typography.Text>{account.phoneNumber}</Typography.Text>
          </Space>
          {fullAddress && (
            <Tooltip title={fullAddress}>
              <Space style={{ maxWidth: 250 }}>
                <EnvironmentOutlined />
                <Typography.Text type="secondary" ellipsis>
                  {fullAddress}
                </Typography.Text>
              </Space>
            </Tooltip>
          )}
          {canNavigate && (
            <Button
              icon={<CarOutlined />}
              size="small"
              onClick={handleDirectionsClick}
              style={{ marginTop: "4px" }}
            >
              Chỉ đường
            </Button>
          )}
        </Space>
      )
    },
  }

  const testTakersColumns = {
    title: "Người xét nghiệm & Mã mẫu",
    key: "testTakers",
    render: (_, record) => {
      const { testTakers, sampleIdentifyNumbers } = record.caseMember
      if (!testTakers || testTakers.length === 0) {
        return "—"
      }

      return (
        <Space direction="vertical" size={4}>
          {testTakers.map((taker, index) => (
            <div key={taker._id}>
              <Text strong>{taker.name}</Text>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {/* Lấy các mã mẫu tương ứng */}
                {sampleIdentifyNumbers
                  .filter((_, i) => (i % 2) === (index % 2))
                  .map((sampleId, i) => (
                    <div key={i}>{sampleId}</div>
                  ))}
              </div>
            </div>
          ))}
        </Space>
      )
    },
  }


  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Mã dịch vụ",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{id}</div>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => {
        const bookingDate = new Date(date)
        return (
          <div>
            <div style={{ fontWeight: "bold" }}>{bookingDate.toLocaleDateString("vi-VN")}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {bookingDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )
      },
      sorter: (a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: "Thời gian tạo",
      key: "createdTime",
      render: (_, record) => {
        const now = new Date()
        const bookingDate = new Date(record.bookingDate)
        const diffInHours = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60))
        const diffInDays = Math.floor(diffInHours / 24)

        if (diffInDays > 0) {
          return `${diffInDays} ngày trước`
        } else if (diffInHours > 0) {
          return `${diffInHours} giờ trước`
        } else {
          return "Vừa tạo"
        }
      },
    },
    ...(isAtHome ? [customerCollumns] : []),
    testTakersColumns,
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const availableStatuses = getAvailableNextStatuses(record.statusDetails)
        const canUpdate = availableStatuses.length > 0

        return (
          <Space direction="vertical" size="small">
            <Dropdown overlay={getStatusUpdateMenu(record)} trigger={["click"]} disabled={!canUpdate}>
              <Button type="primary" disabled={!canUpdate}>
                {canUpdate ? "Cập nhật trạng thái" : "Không thể cập nhật"}
              </Button>
            </Dropdown>

            <Upload
              beforeUpload={(file) => {
                handleImageUpload(file, record)
                return false
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

  const serviceCases = selectedStatus && serviceCasesData?.data && !serviceCasesError ? serviceCasesData.data : []

  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)

  const currentStatusName =
    statusListData?.data?.find((status: ServiceCaseStatus) => status._id === selectedStatus)?.testRequestStatus || ""

  const newStatusName =
    statusListData?.data?.find((status: ServiceCaseStatus) => status._id === newStatusId)?.testRequestStatus || ""

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý trường hợp dịch vụ</Title>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Lọc theo trạng thái:</span>
          <Select
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value)
            }}
            style={{ width: 250 }}
            placeholder="Chọn trạng thái dịch vụ"
            loading={isLoadingStatus}
            disabled={isLoadingStatus}
          >
            {[...(statusListData?.data || [])]
              .sort((a: ServiceCaseStatus, b: ServiceCaseStatus) => a.order - b.order)
              .map((status: ServiceCaseStatus) => (
                <Select.Option key={status._id} value={status._id}>
                  {status.testRequestStatus}
                </Select.Option>
              ))}
          </Select>
          <Select
            value={isAtHome}
            onChange={setIsAtHome}
            style={{ width: 200 }}
            options={[
              { value: true, label: "🏠 Dịch vụ tại nhà" },
              { value: false, label: "🏥 Dịch vụ tại cơ sở" },
            ]}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedStatus && (
            <Tag color={getStatusColor(currentStatusName)}>
              {currentStatusName}: {totalItems} dịch vụ
            </Tag>
          )}
          {!selectedStatus && <span style={{ fontSize: "14px", color: "#666" }}>Chọn trạng thái để xem dịch vụ</span>}
        </div>
      </div>

      {!selectedStatus ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
            Vui lòng chọn trạng thái để xem danh sách dịch vụ
          </div>
        </div>
      ) : isLoadingServices ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : serviceCasesError || totalItems === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
            {`Không có dịch vụ nào với trạng thái "${currentStatusName}"`}
          </div>
        </div>
      ) : (
        <>
          <Table
            dataSource={paginatedData}
            columns={columns}
            rowKey="_id"
            pagination={false}
            loading={isFetchingServices}
            locale={{
              emptyText: `Không có dịch vụ nào với trạng thái "${currentStatusName}"`,
            }}
          />
          {totalItems > 0 && (
            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={totalItems}
              style={{ textAlign: "center", paddingTop: 20 }}
              onChange={(page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ (${currentStatusName})`}
            />
          )}
        </>
      )}

      <Modal
        title="Xác nhận cập nhật trạng thái"
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
          setNewStatusId("")
        }}
        confirmLoading={isUpdating}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div style={{ padding: "16px 0" }}>
          <p>
            <strong>Mã dịch vụ:</strong> {selectedServiceCase?._id.slice(-8).toUpperCase()}
          </p>
          <p>
            <strong>Trạng thái hiện tại:</strong>{" "}
            <Tag color={getStatusColor(selectedServiceCase?.statusDetails || "")}>
              {selectedServiceCase?.statusDetails}
            </Tag>
          </p>
          <p>
            <strong>Trạng thái mới:</strong> <Tag color={getStatusColor(newStatusName)}>{newStatusName}</Tag>
          </p>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff7e6",
              borderRadius: "6px",
            }}
          >
            <strong>⚠️ Lưu ý:</strong> Việc cập nhật trạng thái không thể hoàn tác sau khi thực hiện!
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SampleCollectorServiceCase