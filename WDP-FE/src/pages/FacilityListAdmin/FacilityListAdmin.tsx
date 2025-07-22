"use client"

import type React from "react"
import { useState } from "react"
import { Table, Button, Input, Typography, Spin, Pagination, Popconfirm, Space, Modal, Descriptions, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { SearchOutlined, PlusOutlined, DeleteOutlined, EyeFilled } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { useGetFacilitiesListQuery, useGetFacilityDetailQuery } from "../../features/admin/facilitiesAPI"
import { useSearchParams } from "react-router-dom"

const { Title } = Typography

interface Address {
  _id: string
  fullAddress: string
  location: {
    type: string
    coordinates: [number, number]
  }
}

interface Facility {
  _id: string
  facilityName: string
  address: Address
  phoneNumber: string
}

interface FacilityResponse {
  data: Facility[]
  isLoading: boolean
  isFetching: boolean
  pagination: {
    totalItems: number
    pageSize: number
    totalPages: number
    currentPage: number
  }
}

const FacilityListAdmin: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState<string>("")
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get("pageNumber") || "1"
  const pageSize = searchParams.get("pageSize") || "10"

  const { data, isLoading, isFetching } = useGetFacilitiesListQuery<FacilityResponse>({
    pageNumber: Number(pageNumber),
    pageSize: Number(pageSize),
  })

  // Query for facility detail
  const {
    data: facilityDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useGetFacilityDetailQuery(selectedFacilityId, {
    skip: !selectedFacilityId,
  })

  const handleViewDetail = (facilityId: string) => {
    setSelectedFacilityId(facilityId)
    setIsDetailModalVisible(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false)
    setSelectedFacilityId(null)
  }

  // Filter facilities based on search text
  const filteredData = data?.data?.filter((facility) =>
    facility.facilityName.toLowerCase().includes(searchText.toLowerCase()),
  )

  const columns: ColumnsType<Facility> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        const currentPage = Number(pageNumber)
        const currentPageSize = Number(pageSize)
        return (currentPage - 1) * currentPageSize + index + 1
      },
    },
    {
      title: "Tên cơ sở",
      dataIndex: "facilityName",
      key: "facilityName",
      sorter: (a, b) => a.facilityName.localeCompare(b.facilityName),
      render: (text: string) => <span style={{ fontWeight: 500, color: "#1677ff" }}>{text}</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: ["address", "fullAddress"],
      key: "address",
      ellipsis: true,
      render: (address: string) => (
        <span style={{ fontSize: "13px", color: "#666" }}>{address || "Không có địa chỉ"}</span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (phone: string | null) => <Tag color={phone ? "blue" : "default"}>{phone || "Không có"}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 100,
      align: "center",
      render: () => <Tag color="green">Hoạt động</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeFilled />}
            type="primary"
            size="small"
            onClick={() => handleViewDetail(record._id)}
            title="Xem chi tiết"
          />
          <Popconfirm
            title="Xác nhận xóa cơ sở này?"
            description="Hành động này không thể hoàn tác!"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            // onConfirm={() => handleDelete(record._id)}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              title="Xóa cơ sở"
              // loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý cơ sở</Title>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên cơ sở..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {searchText && (
            <span style={{ fontSize: "14px", color: "#666" }}>Tìm thấy {filteredData?.length || 0} kết quả</span>
          )}
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/createFacility")}>
          Thêm cơ sở mới
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Đang tải danh sách cơ sở..." />
        </div>
      ) : (
        <>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="_id"
            pagination={false}
            loading={isFetching}
            locale={{
              emptyText: searchText ? `Không tìm thấy cơ sở nào với từ khóa "${searchText}"` : "Chưa có cơ sở nào",
            }}
            scroll={{ x: 800 }}
          />

          <Pagination
            current={Number(pageNumber)}
            pageSize={Number(pageSize)}
            total={data?.pagination?.totalItems || 0}
            onChange={(page, size) => {
              navigate(`/admin/facilities?pageNumber=${page}&pageSize=${size}`)
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} cơ sở`}
            pageSizeOptions={["5", "10", "20", "50"]}
            style={{
              marginTop: "20px",
              textAlign: "center",
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          />
        </>
      )}

      {/* Facility Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeFilled style={{ color: "#1677ff" }} />
            <span>Chi tiết cơ sở</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              handleCloseDetailModal()
              navigate(`/admin/facility/edit/${selectedFacilityId}`)
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {isLoadingDetail ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Đang tải thông tin chi tiết..." />
          </div>
        ) : detailError ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#ff4d4f" }}>
            <p>Không thể tải thông tin chi tiết cơ sở</p>
            <p style={{ fontSize: "12px", color: "#999" }}>Lỗi: {(detailError as any)?.message || "Không xác định"}</p>
          </div>
        ) : facilityDetail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã cơ sở">
              <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>
                {facilityDetail._id}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Tên cơ sở">
              <strong style={{ color: "#1677ff", fontSize: "16px" }}>{facilityDetail.facilityName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Tag color="blue" style={{ fontSize: "14px" }}>
                {facilityDetail.phoneNumber || "Không có"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ đầy đủ">
              <div style={{ lineHeight: "1.6" }}>{facilityDetail.address?.fullAddress || "Không có địa chỉ"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Mã địa chỉ">
              <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>
                {facilityDetail.address?._id || "N/A"}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="Tọa độ GPS">
              {facilityDetail.address?.location?.coordinates ? (
                <div>
                  <div>
                    <strong>Kinh độ:</strong> {facilityDetail.address.location.coordinates[0]}
                  </div>
                  <div>
                    <strong>Vĩ độ:</strong> {facilityDetail.address.location.coordinates[1]}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        const [lng, lat] = facilityDetail.address.location.coordinates
                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
                      }}
                    >
                      📍 Xem trên Google Maps
                    </Button>
                  </div>
                </div>
              ) : (
                <span style={{ color: "#999" }}>Không có tọa độ</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="green">Hoạt động</Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>Không có dữ liệu để hiển thị</div>
        )}
      </Modal>
    </div>
  )
}

export default FacilityListAdmin
