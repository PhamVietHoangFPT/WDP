"use client"

import type React from "react"
import { useState } from "react"
import { Table, Button, Typography, Spin, Pagination, message, Space, Select, Dropdown, Menu, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { FilterOutlined, UserAddOutlined, DownOutlined, HomeOutlined, ShopOutlined } from "@ant-design/icons"
import {
  useGetSampleCollectorListQuery,
  useGetServiceNoSampleCollectorListQuery,
} from "../../features/manager/sampleCollectorAPI"

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
  facility: any
  isAtHome?: boolean
}

interface SampleCollector {
  _id: string
  name: string
  email: string
  phoneNumber: string
  addressInfo: string
}

const ServiceCaseListAdmin: React.FC = () => {
  const [isAtHome, setIsAtHome] = useState<boolean>(true)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Fetch danh sach service cases chua gan sample collectors
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
  } = useGetServiceNoSampleCollectorListQuery(isAtHome)

  // Fetch danh sach sample collectors
  const { data: sampleCollectorsData, isLoading: isLoadingSampleCollectors } = useGetSampleCollectorListQuery({
    pageNumber: 1,
    pageSize: 100, 
  })

  // Chua gán nhân viên lấy mẫu cho dịch vụ
  const handleAssignSampleCollector = (serviceCaseId: string, collectorId: string, collectorName: string) => {
    
    message.success(`Đã gán nhân viên lấy mẫu ${collectorName} cho dịch vụ`)
    console.log("Assign collector:", { serviceCaseId, collectorId })
  }

  const getSampleCollectorMenu = (serviceCaseId: string) => {
    const collectors = sampleCollectorsData?.data || []

    return (
      <Menu
        items={collectors.map((collector: SampleCollector) => ({
          key: collector._id,
          label: (
            <div onClick={() => handleAssignSampleCollector(serviceCaseId, collector._id, collector.name)}>
              <div style={{ fontWeight: "bold" }}>{collector.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{collector.email}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{collector.phoneNumber}</div>
            </div>
          ),
        }))}
      />
    )
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.account.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.account.email}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.phoneNumber}</div>
        </div>
      ),
    },
    {
      title: "Loại dịch vụ",
      key: "serviceType",
      render: (_, record) => (
        <Tag icon={isAtHome ? <HomeOutlined /> : <ShopOutlined />} color={isAtHome ? "green" : "blue"}>
          {isAtHome ? "Tại nhà" : "Tại cơ sở"}
        </Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: "Tổng phí",
      dataIndex: "totalFee",
      key: "totalFee",
      render: (fee: number) => `${fee.toLocaleString("vi-VN")} VNĐ`,
      sorter: (a, b) => a.totalFee - b.totalFee,
    },
    {
      title: "Cơ sở",
      key: "facility",
      render: (_, record) => record.facility?.facilityName || "N/A",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {isAtHome && (
            <Dropdown
              overlay={getSampleCollectorMenu(record._id)}
              trigger={["click"]}
              disabled={isLoadingSampleCollectors}
            >
              <Button type="primary" icon={<UserAddOutlined />} loading={isLoadingSampleCollectors}>
                Gán nhân viên <DownOutlined />
              </Button>
            </Dropdown>
          )}
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
      <Title level={2}>Quản lý dịch vụ chưa có nhân viên lấy mẫu</Title>

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
          <FilterOutlined />
          <span>Lọc theo loại dịch vụ:</span>
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
            dataSource={paginatedData}
            columns={columns}
            rowKey="_id"
            pagination={false}
            loading={isFetchingServices}
            locale={{
              emptyText: isAtHome
                ? "Không có dịch vụ tại nhà nào chưa được gán nhân viên lấy mẫu"
                : "Không có dịch vụ tại cơ sở nào chưa được gán nhân viên lấy mẫu",
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
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ`}
            />
          )}
        </>
      )}
    </div>
  )
}

export default ServiceCaseListAdmin
