import type React from "react"
import { useState } from "react"
import { Table, Typography, Spin, Tag, Button } from "antd"
import type { ColumnsType } from "antd/es/table"
import { EyeOutlined } from "@ant-design/icons"
import { useGetServiceCaseWithoutResultsListQuery } from "../../features/doctor/doctorAPI"

const { Title } = Typography

interface ServiceCase {
  _id: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
  caseMember: string
  facility: {
    name: string
  }
}

const DoctorServiceCaseWithoutResult: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Fetch service cases without results
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
  } = useGetServiceCaseWithoutResultsListQuery({
    pageNumber,
    pageSize,
  })

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
      render: (id: string) => (
        <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: "bold" }}>
          {id.slice(-8).toUpperCase()}
        </div>
      ),
    },
    {
      title: "Trạng thái hiện tại",
      key: "currentStatus",
      render: (_, record) => <Tag color="orange">{record.currentStatus.testRequestStatus}</Tag>,
    },
    {
      title: "Thứ tự xử lý",
      key: "order",
      render: (_, record) => (
        <div style={{ textAlign: "center", fontWeight: "bold" }}>{record.currentStatus.order}</div>
      ),
      sorter: (a, b) => a.currentStatus.order - b.currentStatus.order,
    },
    {
      title: "Cơ sở",
      key: "facility",
      render: (_, record) => <div style={{ fontWeight: "500" }}>{record.facility.name}</div>,
    },
    {
      title: "Thành viên phụ trách",
      dataIndex: "caseMember",
      key: "caseMember",
      render: (caseMember: string) => (
        <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{caseMember.slice(-8).toUpperCase()}</div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record._id)} size="small">
          Xem chi tiết
        </Button>
      ),
    },
  ]

  // Get data from API response
  const serviceCases = serviceCasesData?.data || []
  const totalItems = serviceCases.length

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag color="orange">Chờ duyệt kết quả</Tag>
          <span style={{ fontSize: "14px", color: "#666" }}>Danh sách các dịch vụ đang chờ bác sĩ duyệt kết quả</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "14px", color: "#666" }}>Tổng: {totalItems} dịch vụ</span>
        </div>
      </div>

      {isLoadingServices ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table
            dataSource={serviceCases}
            columns={columns}
            rowKey="_id"
            pagination={{
              current: pageNumber,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ`,
              onChange: (page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              },
            }}
            loading={isFetchingServices}
            locale={{
              emptyText: "Không có dịch vụ nào chưa có kết quả",
            }}
            scroll={{ x: 800 }}
          />
        </>
      )}
    </div>
  )
}

export default DoctorServiceCaseWithoutResult
