"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, Typography, Spin, Pagination, Select, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  useGetServiceCaseStatusListQuery,
  useGetAllServiceCasesQuery,
} from "../../features/sampleCollector/sampleCollectorAPI"

const { Title } = Typography

interface ServiceCase {
  _id: string
  statusDetails: string
  bookingDate: string
}

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const SampleCollectorServiceCase: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Fetch service case status list for dropdown
  const { data: statusListData, isLoading: isLoadingStatus } = useGetServiceCaseStatusListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  // Fetch service cases based on selected status
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetAllServiceCasesQuery(selectedStatus, {
    skip: !selectedStatus,
  })

  // Reset page number when status changes
  useEffect(() => {
    setPageNumber(1)
  }, [selectedStatus])

  // Get status color based on status name
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chờ xử lý":
        return "orange"
      case "Đang lấy mẫu":
        return "blue"
      case "Đã nhận mẫu":
        return "green"
      default:
        return "default"
    }
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Mã dịch vụ",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => (
        <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{id.slice(-8).toUpperCase()}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusDetails",
      key: "statusDetails",
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
  ]

  // Handle service cases data properly - ensure we get fresh data for each filter
  const serviceCases = selectedStatus && serviceCasesData?.data ? serviceCasesData.data : []
  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)

  // Get current status name for display
  const currentStatusName =
    statusListData?.data?.find((status: ServiceCaseStatus) => status._id === selectedStatus)?.testRequestStatus || ""

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
      ) : serviceCasesError ? (
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
    </div>
  )
}

export default SampleCollectorServiceCase
