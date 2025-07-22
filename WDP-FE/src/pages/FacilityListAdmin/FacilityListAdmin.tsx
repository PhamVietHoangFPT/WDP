import React, { useState } from 'react'
import {
  Table,
  Button,
  Input,
  Typography,
  Spin,
  Pagination,
  Popconfirm,
  Space,
  Modal,
  Descriptions,
  Tag,
  Form,
  Select,
  Switch,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { SearchOutlined, PlusOutlined, DeleteOutlined, EyeFilled, EditOutlined, SaveOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import {
  useGetFacilitiesListQuery,
  useGetFacilityDetailQuery,
  useUpdateFacilityMutation,
} from "../../features/admin/facilitiesAPI"
import {
  useGetProvinceListQuery,
  useGetWardListQuery,
  useCreateFacilityAddressMutation,
} from "../../features/location/location"
import { useSearchParams } from "react-router-dom"

const { Title } = Typography
const { Option } = Select

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

interface Province {
  _id: string
  Code: string
  FullName: string
}

interface Ward {
  Code: string
  FullName: string
  ProvinceCode: string
}

const FacilityListAdmin: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState<string>("")
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get("pageNumber") || "1"
  const pageSize = searchParams.get("pageSize") || "10"

  // Edit form states
  const [form] = Form.useForm()
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [houseNumberValue, setHouseNumberValue] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(true)

  const { data, isLoading, isFetching, refetch } = useGetFacilitiesListQuery<FacilityResponse>({
    pageNumber: Number(pageNumber),
    pageSize: Number(pageSize),
  })

  // Query for facility detail
  const {
    data: facilityDetail,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useGetFacilityDetailQuery(selectedFacilityId, {
    skip: !selectedFacilityId,
  })

  // Location queries for edit form
  const { data: provincesData, isLoading: provincesLoading } = useGetProvinceListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  const { data: wardsData, isLoading: wardsLoading } = useGetWardListQuery(
    {
      pageNumber: 1,
      pageSize: 1000,
      province_code: selectedProvince?.Code,
    },
    {
      skip: !selectedProvince?.Code,
    },
  )

  // Mutations
  const [createFacilityAddress] = useCreateFacilityAddressMutation()
  const [updateFacility, { isLoading: isUpdating }] = useUpdateFacilityMutation()

  // Parse existing address to extract components
  const parseExistingAddress = (fullAddress: string) => {
    if (!fullAddress) return { houseNumber: "", ward: "", province: "" }

    const parts = fullAddress.split(",").map((part) => part.trim())

    if (parts.length >= 3) {
      const houseNumber = parts[0]
      const wardName = parts[1]
      const provinceName = parts[2]

      return { houseNumber, ward: wardName, province: provinceName }
    }

    return { houseNumber: fullAddress, ward: "", province: "" }
  }

  // Initialize form with existing data when entering edit mode
  useEffect(() => {
    if (isEditMode && facilityDetail && provincesData) {
      const addressParts = parseExistingAddress(facilityDetail.address?.fullAddress || "")

      // Find matching province
      const matchingProvince = provincesData.find((p: Province) =>
        addressParts.province.includes(p.FullName.replace("Tỉnh ", "").replace("Thành phố ", "")),
      )

      if (matchingProvince) {
        setSelectedProvince(matchingProvince)
      }

      setHouseNumberValue(addressParts.houseNumber)
      setIsActive(true)

      form.setFieldsValue({
        facilityName: facilityDetail.facilityName,
        phoneNumber: facilityDetail.phoneNumber,
        province: matchingProvince?.Code,
        houseNumber: addressParts.houseNumber,
        isActive: true,
      })
    }
  }, [isEditMode, facilityDetail, provincesData, form])

  // Set ward when wards data is loaded
  useEffect(() => {
    if (isEditMode && facilityDetail && wardsData && selectedProvince) {
      const addressParts = parseExistingAddress(facilityDetail.address?.fullAddress || "")
      const matchingWard = wardsData.find((w: Ward) =>
        addressParts.ward.includes(w.FullName.replace("Phường ", "").replace("Xã ", "").replace("Thị trấn ", "")),
      )

      if (matchingWard) {
        setSelectedWard(matchingWard)
        form.setFieldsValue({
          ward: matchingWard.Code,
        })
      }
    }
  }, [wardsData, selectedProvince, facilityDetail, form, isEditMode])

  const handleViewDetail = (facilityId: string) => {
    setSelectedFacilityId(facilityId)
    setIsDetailModalVisible(true)
    setIsEditMode(false)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false)
    setSelectedFacilityId(null)
    setIsEditMode(false)
    setSelectedProvince(null)
    setSelectedWard(null)
    setHouseNumberValue("")
    form.resetFields()
  }

  const handleEnterEditMode = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setSelectedProvince(null)
    setSelectedWard(null)
    setHouseNumberValue("")
    form.resetFields()
  }

  const handleProvinceChange = (value: string) => {
    const province = provincesData?.find((p: Province) => p.Code === value)
    setSelectedProvince(province || null)
    setSelectedWard(null)
    form.setFieldsValue({ ward: undefined })
  }

  const handleWardChange = (value: string) => {
    const ward = wardsData?.find((w: Ward) => w.Code === value)
    setSelectedWard(ward || null)
  }

  const handleUpdateSubmit = async (values: any) => {
    try {
      if (!selectedProvince || !selectedWard) {
        message.error("Vui lòng chọn đầy đủ thông tin địa chỉ")
        return
      }

      const fullAddress = `${values.houseNumber || ""}, ${selectedWard.FullName}, ${selectedProvince.FullName}`.trim()

      // Create new address if address changed
      let addressId = facilityDetail?.address?._id

      if (fullAddress !== facilityDetail?.address?.fullAddress) {
        const addressResponse = await createFacilityAddress({
          data: { fullAddress },
        }).unwrap()
        addressId = addressResponse._id
      }

      // Update facility
      const facilityData = {
        facilityName: values.facilityName,
        phoneNumber: values.phoneNumber,
        address: addressId,
        isActive: values.isActive,
      }

      await updateFacility({
        data: facilityData,
        id: selectedFacilityId!,
      }).unwrap()

      message.success("Cập nhật cơ sở thành công!")
      setIsEditMode(false)
      refetch() // Refresh the list
      refetchDetail() // Refresh the detail
    } catch (error: any) {
      console.error("Error updating facility:", error)
      if (error.status === 404) {
        message.error("Tên, số điện thoại hoặc địa chỉ đã tồn tại")
      } else {
        message.error(error?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật cơ sở")
      }
    }
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
    // {
    //   title: "Trạng thái",
    //   key: "status",
    //   width: 100,
    //   align: "center",
    //   render: () => <Tag color="green">Hoạt động</Tag>,
    // },
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

      {/* Facility Detail/Edit Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isEditMode ? <EditOutlined style={{ color: "#faad14" }} /> : <EyeFilled style={{ color: "#1677ff" }} />}
            <span>{isEditMode ? "Chỉnh sửa cơ sở" : "Chi tiết cơ sở"}</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={
          isEditMode
            ? [
                <Button key="cancel" onClick={handleCancelEdit} disabled={isUpdating}>
                  Hủy
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={isUpdating}
                  onClick={() => form.submit()}
                >
                  Lưu thay đổi
                </Button>,
              ]
            : [
                <Button key="close" onClick={handleCloseDetailModal}>
                  Đóng
                </Button>,
                <Button key="edit" type="primary" icon={<EditOutlined />} onClick={handleEnterEditMode}>
                  Chỉnh sửa
                </Button>,
              ]
        }
        width={700}
        destroyOnClose={false}
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
          <>
            {/* View Mode */}
            {!isEditMode && (
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
                {/* <Descriptions.Item label="Trạng thái">
                  <Tag color="green">Hoạt động</Tag>
                </Descriptions.Item> */}
              </Descriptions>
            )}

            {/* Edit Mode */}
            {isEditMode && (
              <Form form={form} layout="vertical" onFinish={handleUpdateSubmit} disabled={isUpdating}>
                <Form.Item
                  label="Tên cơ sở"
                  name="facilityName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên cơ sở" },
                    { min: 2, message: "Tên cơ sở phải có ít nhất 2 ký tự" },
                    { max: 100, message: "Tên cơ sở không được quá 100 ký tự" },
                  ]}
                >
                  <Input placeholder="Nhập tên cơ sở" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại phải có 10-11 chữ số",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                {/* <Form.Item label="Trạng thái hoạt động" name="isActive" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" onChange={setIsActive} />
                </Form.Item> */}

                <Form.Item
                  label="Tỉnh/Thành phố"
                  name="province"
                  rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                >
                  <Select
                    placeholder="Chọn tỉnh/thành phố"
                    loading={provincesLoading}
                    onChange={handleProvinceChange}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {provincesData?.map((province: Province) => (
                      <Option key={province.Code} value={province.Code}>
                        {province.FullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Phường/Xã"
                  name="ward"
                  rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                >
                  <Select
                    placeholder="Chọn phường/xã"
                    loading={wardsLoading}
                    onChange={handleWardChange}
                    disabled={!selectedProvince}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {wardsData?.map((ward: Ward) => (
                      <Option key={ward.Code} value={ward.Code}>
                        {ward.FullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Số nhà/Địa chỉ cụ thể"
                  name="houseNumber"
                  rules={[{ required: true, message: "Vui lòng nhập số nhà/địa chỉ cụ thể" }]}
                >
                  <Input
                    placeholder="Nhập số nhà, tên đường..."
                    onChange={(e) => setHouseNumberValue(e.target.value)}
                  />
                </Form.Item>

                {selectedProvince && selectedWard && (
                  <Form.Item label="Địa chỉ đầy đủ (xem trước)">
                    <Input
                      value={`${houseNumberValue || ""}, ${selectedWard.FullName}, ${selectedProvince.FullName}`.trim()}
                      disabled
                      style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                    />
                  </Form.Item>
                )}

                <Form.Item label="Địa chỉ hiện tại">
                  <Input
                    value={facilityDetail.address?.fullAddress || "Không có địa chỉ"}
                    disabled
                    style={{ backgroundColor: "#fff1f0", color: "#999" }}
                  />
                </Form.Item>
              </Form>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>Không có dữ liệu để hiển thị</div>
        )}
      </Modal>
    </div>
  )
}

export default FacilityListAdmin
