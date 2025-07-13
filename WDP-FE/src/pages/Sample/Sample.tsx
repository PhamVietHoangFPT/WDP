"use client"

import type React from "react"
import { useState } from "react"
import { Table, Button, Typography, Spin, Pagination, message, Space, Select, Dropdown, Menu, Tag, Modal } from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  FilterOutlined,
  UserAddOutlined,
  DownOutlined,
  HomeOutlined,
  ShopOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import {
  useGetSampleCollectorListQuery,
  useGetServiceNoSampleCollectorListQuery,
  useAddSampleCollectorToServiceCaseMutation,
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
  facility: {
    _id: string
    name: string
  }
  isAtHome?: boolean
}

interface SampleCollector {
  _id: string
  name: string
  email: string
  phoneNumber: string
  addressInfo: string
}

const ManagerServiceCaseWithoutSampleCollector: React.FC = () => {
  const [isAtHome, setIsAtHome] = useState<boolean>(true)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null)
  const [selectedSampleCollector, setSelectedSampleCollector] = useState<SampleCollector | null>(null)

  // Fetch service cases without sample collectors
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetServiceNoSampleCollectorListQuery(isAtHome)

  // Fetch sample collectors list
  const { data: sampleCollectorsData, isLoading: isLoadingSampleCollectors } = useGetSampleCollectorListQuery({
    pageNumber: 1,
    pageSize: 100, // Get all sample collectors for dropdown
  })

  // Mutation để gán sample collector cho service case
  const [addSampleCollectorToServiceCase, { isLoading: isAssigning }] = useAddSampleCollectorToServiceCaseMutation()

  // Xử lý gán sample collector cho service case
  const handleAssignSampleCollector = (serviceCase: ServiceCase, sampleCollector: SampleCollector) => {
    setSelectedServiceCase(serviceCase)
    setSelectedSampleCollector(sampleCollector)
    setConfirmModalVisible(true)
  }

  // Xác nhận gán sample collector
  const handleConfirmAssignment = async () => {
    if (!selectedServiceCase || !selectedSampleCollector) return

    try {
      await addSampleCollectorToServiceCase({
        serviceCaseId: selectedServiceCase._id,
        sampleCollectorId: selectedSampleCollector._id,
        data: {}, // Empty data object as required by API
      }).unwrap()

      message.success(`Đã gán nhân viên lấy mẫu ${selectedSampleCollector.name} cho dịch vụ thành công!`)
      setConfirmModalVisible(false)
      setSelectedServiceCase(null)
      setSelectedSampleCollector(null)
    } catch (error: any) {
      console.error("Error assigning sample collector:", error)
      message.error(error?.data?.message || "Gán nhân viên lấy mẫu thất bại!")
    }
  }

  // Hủy gán sample collector
  const handleCancelAssignment = () => {
    setConfirmModalVisible(false)
    setSelectedServiceCase(null)
    setSelectedSampleCollector(null)
  }

  const getSampleCollectorMenu = (serviceCaseId: string) => {
    const collectors = sampleCollectorsData?.data || []

    if (collectors.length === 0) {
      return (
        <Menu
          items={[
            {
              key: "no-collectors",
              label: <span style={{ color: "#999" }}>Không có nhân viên nào</span>,
              disabled: true,
            },
          ]}
        />
      )
    }

    return (
      <Menu
        items={collectors.map((collector: SampleCollector) => ({
          key: collector._id,
          label: (
            <div
              onClick={() => {
                const serviceCase = serviceCases.find((sc) => sc._id === serviceCaseId)
                if (serviceCase) {
                  handleAssignSampleCollector(serviceCase, collector)
                }
              }}
            >
              <div style={{ fontWeight: "bold" }}>{collector.name}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{collector.email}</div>
              <div style={{ fontSize: "12px", color: "#666" }}>{collector.phoneNumber}</div>
              {collector.addressInfo && (
                <div style={{ fontSize: "11px", color: "#999" }}>Địa chỉ: {collector.addressInfo}</div>
              )}
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
      render: (_, record) => record.facility?.name || "N/A",
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
          <span style={{ fontSize: "14px", color: "#666" }}>
            Tổng: {serviceCasesError?.status === 404 ? 0 : totalItems} dịch vụ
          </span>
        </div>
      </div>

      {isLoadingServices ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : serviceCasesError && serviceCasesError.status === 404 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
            {isAtHome
              ? "Không có dịch vụ tại nhà nào chưa được gán nhân viên lấy mẫu"
              : "Không có dịch vụ tại cơ sở nào chưa được gán nhân viên lấy mẫu"}
          </div>
          <Button type="primary" onClick={() => setIsAtHome(!isAtHome)}>
            Xem {isAtHome ? "dịch vụ tại cơ sở" : "dịch vụ tại nhà"}
          </Button>
        </div>
      ) : serviceCasesError ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#ff4d4f" }}>
            Có lỗi xảy ra khi tải dữ liệu: {serviceCasesError.data?.message || "Unknown error"}
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

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
            <span>Xác nhận gán nhân viên lấy mẫu</span>
          </div>
        }
        open={confirmModalVisible}
        onOk={handleConfirmAssignment}
        onCancel={handleCancelAssignment}
        confirmLoading={isAssigning}
        okText="Xác nhận gán"
        cancelText="Hủy"
        okButtonProps={{ type: "primary" }}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <strong>Thông tin dịch vụ:</strong>
            <div style={{ marginLeft: "16px", marginTop: "8px" }}>
              <div>• Khách hàng: {selectedServiceCase?.account.name}</div>
              <div>• Email: {selectedServiceCase?.account.email}</div>
              <div>• Số điện thoại: {selectedServiceCase?.phoneNumber}</div>
              <div>• Loại dịch vụ: {selectedServiceCase?.isAtHome ? "Tại nhà" : "Tại cơ sở"}</div>
              <div>
                • Ngày đặt:{" "}
                {selectedServiceCase?.bookingDate
                  ? new Date(selectedServiceCase.bookingDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </div>
              <div>
                • Tổng phí:{" "}
                {selectedServiceCase?.totalFee ? `${selectedServiceCase.totalFee.toLocaleString("vi-VN")} VNĐ` : "N/A"}
              </div>
              <div>• Cơ sở: {selectedServiceCase?.facility?.name || "N/A"}</div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <strong>Nhân viên lấy mẫu được chọn:</strong>
            <div style={{ marginLeft: "16px", marginTop: "8px" }}>
              <div>• Tên: {selectedSampleCollector?.name}</div>
              <div>• Email: {selectedSampleCollector?.email}</div>
              <div>• Số điện thoại: {selectedSampleCollector?.phoneNumber}</div>
              {selectedSampleCollector?.addressInfo && <div>• Địa chỉ: {selectedSampleCollector.addressInfo}</div>}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              backgroundColor: "#fff7e6",
              borderRadius: "6px",
              border: "1px solid #ffd591",
            }}
          >
            <strong style={{ color: "#d46b08" }}>⚠️ Lưu ý:</strong>
            <div style={{ color: "#d46b08", marginTop: "4px" }}>
              Sau khi gán nhân viên lấy mẫu, dịch vụ sẽ được chuyển sang trạng thái "Đã có nhân viên phụ trách" và không
              thể hoàn tác.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManagerServiceCaseWithoutSampleCollector
