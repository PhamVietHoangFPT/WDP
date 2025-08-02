import type React from "react"
import { useState, useEffect } from "react"
import {
  Typography,
  Spin,
  Pagination,
  Select,
  Tag,
  Button,
  Space,
  Tooltip,
  Card,
  List,
  Flex,
  Modal,
  Image,
} from "antd"
import {
  useGetAllDoneServiceCasesQuery,
  useGetImageByServiceCaseQuery,
} from "../../features/sampleCollector/sampleCollectorAPI"
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  EyeOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography

interface ServiceCase {
  _id: string
  currentStatus?: string
  bookingDetails: {
    bookingDate: string
    slotTime: string
  }
  accountDetails: {
    _id: string
    name: string
    phoneNumber: string
    address: {
      fullAddress: string
      location: {
        type: string
        coordinates: number[]
      }
    }
  }
  caseMember: {
    testTakers: {
      _id: string
      name: string
      personalId: string
    }[]
    sampleIdentifyNumbers: string[]
    isSelfSampling: boolean
    isSingleService: boolean
  }
  services: {
    _id: string
    fee: number
    name?: string
    sample: {
      _id: string
      name: string
      fee: number
    }
    timeReturn: string
  }[]
}

interface Image {
  _id: string
  url: string
}

const SampleCollectorDoneServiceCase: React.FC = () => {
  const [isAtHome, setIsAtHome] = useState<boolean>(true)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedServiceCaseId, setSelectedServiceCaseId] = useState<string | null>(null)

  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetAllDoneServiceCasesQuery({ isAtHome: isAtHome })

  const { data: imagesData, isLoading: isLoadingImages } = useGetImageByServiceCaseQuery(
    { ServiceCaseId: selectedServiceCaseId! },
    { skip: !selectedServiceCaseId }
  )

  const showImageModal = (serviceCaseId: string) => {
    setSelectedServiceCaseId(serviceCaseId)
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    setSelectedServiceCaseId(null)
  }

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

  const serviceCases = serviceCasesData?.data && !serviceCasesError ? serviceCasesData.data : []
  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ đã hoàn thành</Title>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
        gap={8}
        wrap="wrap"
      >
        <Flex align="center" gap={8} wrap="wrap">
          <span>Lọc theo loại hình dịch vụ:</span>
          <Select
            value={isAtHome}
            onChange={setIsAtHome}
            style={{ minWidth: 200 }}
            options={[
              { value: true, label: "🏠 Dịch vụ tại nhà" },
              { value: false, label: "🏥 Dịch vụ tại cơ sở" },
            ]}
          />
        </Flex>
        <Flex align="center" gap={8}>
          <Tag>Tổng cộng: {totalItems} dịch vụ</Tag>
        </Flex>
      </Flex>
      {isLoadingServices ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      ) : serviceCasesError || totalItems === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
            {`Không có dịch vụ nào đã hoàn thành với loại hình "${
              isAtHome ? "Dịch vụ tại nhà" : "Dịch vụ tại cơ sở"
            }"`}
          </div>
        </div>
      ) : (
        <>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 1,
              xxl: 1,
            }}
            dataSource={paginatedData}
            loading={isFetchingServices}
            locale={{
              emptyText: `Không có dịch vụ nào đã hoàn thành với loại hình "${
                isAtHome ? "Dịch vụ tại nhà" : "Dịch vụ tại cơ sở"
              }"`,
            }}
            renderItem={(item) => {
              const record = item
              const { testTakers, sampleIdentifyNumbers, isSingleService } = record.caseMember
              const account = record.accountDetails
              const fullAddress = account?.address?.fullAddress
              const coordinates = account?.address?.location?.coordinates
              const canNavigate = fullAddress && coordinates
              const handleDirectionsClick = () => {
                if (!canNavigate) return
                const encodedAddress = encodeURIComponent(fullAddress)
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
                window.open(mapsUrl, "_blank", "noopener,noreferrer")
              }
              const renderSampleNames = (index: number) => {
                if (!record.services || record.services.length === 0) {
                  return <Text type="secondary">Không có mẫu</Text>
                }
                if (isSingleService) {
                  const service = record.services[index]
                  return service ? <Text type="secondary">{service.sample.name}</Text> : null
                } else {
                  return record.services.map((service, i) => (
                    <Text key={i} type="secondary" style={{ display: "block" }}>
                      {service.sample.name}
                    </Text>
                  ))
                }
              }
              return (
                <List.Item>
                  <Card
                    title={
                      <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>
                        Mã dịch vụ: {record._id}
                      </div>
                    }
                  >
                    <Flex vertical gap={12}>
                      <Flex justify="space-between" align="center">
                        <Space>
                          <Typography.Text strong>Ngày giờ hẹn:</Typography.Text>
                          <Text>
                            {new Date(record.bookingDetails.bookingDate).toLocaleDateString("vi-VN")} -{" "}
                            {record.bookingDetails.slotTime}
                          </Text>
                        </Space>
                        <Tag color={getStatusColor(record.currentStatus || "")}>
                          {record.currentStatus}
                        </Tag>
                      </Flex>
                      {isAtHome && account && (
                        <Card size="small" title="Thông tin khách hàng">
                          <Flex vertical gap={4}>
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
                                <Space style={{ maxWidth: "100%", alignItems: "start" }}>
                                  <EnvironmentOutlined />
                                  <div style={{ wordWrap: "break-word", flex: 1 }}>
                                    <Typography.Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
                                      {fullAddress}
                                    </Typography.Text>
                                  </div>
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
                          </Flex>
                        </Card>
                      )}
                      {testTakers && testTakers.length > 0 && (
                        <Card size="small" style={{ height: "300px" }} title="Người xét nghiệm & Mã mẫu">
                          {testTakers.map((taker, index) => (
                            <div key={taker._id} style={{ marginBottom: index < testTakers.length - 1 ? 8 : 0 }}>
                              <Text strong>{taker.name}</Text>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {sampleIdentifyNumbers && sampleIdentifyNumbers.length > 0 ? (
                                  sampleIdentifyNumbers
                                    .filter((_, i) => i % 2 === index % 2)
                                    .map((sampleId, i) => <div key={i}>{sampleId}</div>)
                                ) : (
                                  <Text type="secondary">Không có mã mẫu</Text>
                                )}
                              </div>
                              <div style={{ fontSize: "12px", color: "#999", marginTop: 4 }}>
                                {renderSampleNames(index)}
                              </div>
                            </div>
                          ))}
                        </Card>
                      )}
                      {(!testTakers || testTakers.length === 0) && (
                        <Card size="small" title="Người xét nghiệm & Mã mẫu">
                          <Text type="secondary">—</Text>
                        </Card>
                      )}
                      <Flex style={{ marginTop: 12 }}>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => showImageModal(record._id)}
                        >
                          Xem ảnh
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </List.Item>
              )
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
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ đã hoàn thành`}
            />
          )}
        </>
      )}

      {/* Modal để hiển thị ảnh */}
      <Modal
        title={`Ảnh của dịch vụ: ${selectedServiceCaseId}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {isLoadingImages ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
            {imagesData && imagesData.length > 0 ? (
              imagesData.map((image: Image) => (
                <Image
                  key={image._id}
                  src={`http://localhost:5000${image.url}`}
                  alt="Service Case"
                  width={200}
                />
              ))
            ) : (
              <Text>Không có ảnh nào được tìm thấy cho dịch vụ này.</Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SampleCollectorDoneServiceCase