import type React from 'react'
import { useState, useEffect } from 'react'
import {
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
  Card,
  List,
  Flex,
} from 'antd'
import {
  useGetServiceCaseStatusListQuery,
  useGetAllServiceCasesQuery,
  useUpdateServiceCaseStatusMutation,
} from '../../features/sampleCollector/sampleCollectorAPI'
import { useCreateServiceCaseImageMutation } from '../../features/deliveryStaff/deliveryStaff'
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CarOutlined,
  UploadOutlined,
} from '@ant-design/icons'

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

interface ServiceCaseStatus {
  _id: string
  testRequestStatus: string
  order: number
}

const SampleCollectorServiceCase: React.FC = () => {
  const [isAtHome, setIsAtHome] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [newStatusId, setNewStatusId] = useState<string>('')
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { data: statusListData, isLoading: isLoadingStatus } =
    useGetServiceCaseStatusListQuery({
      pageNumber: 1,
      pageSize: 100,
    })
  const {
    data: serviceCasesData,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
    error: serviceCasesError,
  } = useGetAllServiceCasesQuery(
    { serviceCaseStatus: selectedStatus || '', isAtHome: isAtHome },
    {
      skip: !selectedStatus,
    }
  )
  const [updateServiceCaseStatus, { isLoading: isUpdating }] =
    useUpdateServiceCaseStatusMutation()
  const [createServiceCaseImage, { isLoading: isUploading }] =
    useCreateServiceCaseImageMutation()

  useEffect(() => {
    setPageNumber(1)
  }, [selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'orange'
      case 'Đang lấy mẫu':
        return 'blue'
      case 'Đã nhận mẫu':
        return 'green'
      case 'Check-in':
        return 'purple'
      case 'Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)':
        return 'cyan'
      default:
        return 'default'
    }
  }

  const getCurrentStatusOrder = (statusName: string) => {
    const status = statusListData?.data?.find(
      (s: ServiceCaseStatus) => s.testRequestStatus === statusName
    )
    return status?.order || 0
  }

  const getAvailableNextStatuses = (currentStatusName: string) => {
    const currentOrder = getCurrentStatusOrder(currentStatusName)
    return [...(statusListData?.data || [])]
      .filter((status: ServiceCaseStatus) => status.order > currentOrder)
      .sort((a: ServiceCaseStatus, b: ServiceCaseStatus) => a.order - b.order)
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase || !newStatusId) return
    try {
      await updateServiceCaseStatus({
        id: selectedServiceCase._id,
        currentStatus: newStatusId,
      }).unwrap()
      message.success('Cập nhật trạng thái thành công!')
      setUpdateModalVisible(false)
      setNewStatusId('')
    } catch (error: any) {
      console.error('Update status error:', error)
      message.error(error?.data?.message || 'Cập nhật trạng thái thất bại!')
    }
  }

  const handleImageUpload = async () => {
    if (!fileToUpload || !selectedServiceCase) return

    const formData = new FormData()
    formData.append('serviceCase', selectedServiceCase._id)
    formData.append('file', fileToUpload)

    try {
      await createServiceCaseImage(formData).unwrap()
      message.success('Upload ảnh thành công!')
      setUploadModalVisible(false)
      setFileToUpload(null)
      setPreviewImage(null)
    } catch (error: any) {
      console.error('Upload image error:', error)
      message.error(error?.data?.message || 'Upload ảnh thất bại!')
    }
  }

  const getStatusUpdateMenu = (record: ServiceCase) => {
    const availableStatuses = getAvailableNextStatuses(
      record.currentStatus || ''
    )
    if (availableStatuses.length === 0) {
      return (
        <Menu
          items={[
            {
              key: 'no-update',
              label: (
                <span style={{ color: '#999' }}>Không thể cập nhật thêm</span>
              ),
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

  const handleBeforeUpload = (file: File, record: ServiceCase) => {
    setFileToUpload(file)
    setSelectedServiceCase(record)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setPreviewImage(reader.result as string)
      setUploadModalVisible(true)
    }
    return false // ngan viec tu dong upload neu khong qua modal xac nhan
  }

  const serviceCases =
    selectedStatus && serviceCasesData?.data && !serviceCasesError
      ? serviceCasesData.data
      : []
  const totalItems = serviceCases.length
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = serviceCases.slice(startIndex, endIndex)
  const currentStatusName =
    statusListData?.data?.find(
      (status: ServiceCaseStatus) => status._id === selectedStatus
    )?.testRequestStatus || ''
  const newStatusName =
    statusListData?.data?.find(
      (status: ServiceCaseStatus) => status._id === newStatusId
    )?.testRequestStatus || ''

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý trường hợp dịch vụ</Title>
      <Flex
        justify='space-between'
        align='center'
        style={{ marginBottom: 16 }}
        gap={8}
        wrap='wrap'
      >
        <Flex align='center' gap={8} wrap='wrap'>
          <span>Lọc theo trạng thái:</span>
          <Select
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value)
            }}
            style={{ minWidth: 250 }}
            placeholder='Chọn trạng thái dịch vụ'
            loading={isLoadingStatus}
            disabled={isLoadingStatus}
          >
            {[...(statusListData?.data || [])]
              .sort(
                (a: ServiceCaseStatus, b: ServiceCaseStatus) =>
                  a.order - b.order
              )
              .map((status: ServiceCaseStatus) => (
                <Select.Option key={status._id} value={status._id}>
                  {status.testRequestStatus}
                </Select.Option>
              ))}
          </Select>
          <Select
            value={isAtHome}
            onChange={setIsAtHome}
            style={{ minWidth: 200 }}
            options={[
              { value: true, label: '🏠 Dịch vụ tại nhà' },
              { value: false, label: '🏥 Dịch vụ tại cơ sở' },
            ]}
          />
        </Flex>
        <Flex align='center' gap={8}>
          {selectedStatus && (
            <Tag color={getStatusColor(currentStatusName)}>
              {currentStatusName}: {totalItems} dịch vụ
            </Tag>
          )}
          {!selectedStatus && (
            <span style={{ fontSize: '14px', color: '#666' }}>
              Chọn trạng thái để xem dịch vụ
            </span>
          )}
        </Flex>
      </Flex>
      {!selectedStatus ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div
            style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}
          >
            Vui lòng chọn trạng thái để xem danh sách dịch vụ
          </div>
        </div>
      ) : isLoadingServices ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : serviceCasesError || totalItems === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div
            style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}
          >
            {`Không có dịch vụ nào với trạng thái "${currentStatusName}"`}
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
              emptyText: `Không có dịch vụ nào với trạng thái "${currentStatusName}"`,
            }}
            renderItem={(item) => {
              const record = item
              const { testTakers, sampleIdentifyNumbers, isSingleService } =
                record.caseMember
              const account = record.accountDetails
              const fullAddress = account?.address?.fullAddress
              const coordinates = account?.address?.location?.coordinates
              const canNavigate = fullAddress && coordinates
              const handleDirectionsClick = () => {
                if (!canNavigate) return
                const encodedAddress = encodeURIComponent(fullAddress)
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
                window.open(mapsUrl, '_blank', 'noopener,noreferrer')
              }
              const availableStatuses = getAvailableNextStatuses(
                record.currentStatus || ''
              )
              const canUpdate = availableStatuses.length > 0
              const renderSampleNames = (index: number) => {
                if (!record.services || record.services.length === 0) {
                  return <Text type='secondary'>Không có mẫu</Text>
                }
                if (isSingleService) {
                  const service = record.services[index]
                  return service ? (
                    <Text type='secondary'>{service.sample.name}</Text>
                  ) : null
                } else {
                  return record.services.map((service, i) => (
                    <Text key={i} type='secondary' style={{ display: 'block' }}>
                      {service.sample.name}
                    </Text>
                  ))
                }
              }
              return (
                <List.Item>
                  <Card
                    title={
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        Mã dịch vụ: {record._id}
                      </div>
                    }
                  >
                    <Flex vertical gap={12}>
                      <Flex justify='space-between' align='center'>
                        <Space>
                          <Typography.Text strong>
                            Ngày giờ hẹn:
                          </Typography.Text>
                          <Text>
                            {new Date(
                              record.bookingDetails.bookingDate
                            ).toLocaleDateString('vi-VN')}{' '}
                            - {record.bookingDetails.slotTime}
                          </Text>
                        </Space>
                      </Flex>
                      {isAtHome && account && (
                        <Card size='small' title='Thông tin khách hàng'>
                          <Flex vertical gap={4}>
                            <Space>
                              <UserOutlined />
                              <Typography.Text strong>
                                {account.name}
                              </Typography.Text>
                            </Space>
                            <Space>
                              <PhoneOutlined />
                              <Typography.Text>
                                {account.phoneNumber}
                              </Typography.Text>
                            </Space>
                            {fullAddress && (
                              <Tooltip title={fullAddress}>
                                <Space
                                  style={{
                                    maxWidth: '100%',
                                    alignItems: 'start',
                                  }}
                                >
                                  <EnvironmentOutlined />
                                  <div
                                    style={{ wordWrap: 'break-word', flex: 1 }}
                                  >
                                    <Typography.Text
                                      type='secondary'
                                      style={{ whiteSpace: 'pre-wrap' }}
                                    >
                                      {fullAddress}
                                    </Typography.Text>
                                  </div>
                                </Space>
                              </Tooltip>
                            )}
                            {canNavigate && (
                              <Button
                                icon={<CarOutlined />}
                                size='small'
                                onClick={handleDirectionsClick}
                                style={{ marginTop: '4px' }}
                              >
                                Chỉ đường
                              </Button>
                            )}
                          </Flex>
                        </Card>
                      )}
                      {testTakers && testTakers.length > 0 && (
                        <Card
                          size='small'
                          style={{ height: 'auto' }}
                          title='Người xét nghiệm & Mã mẫu'
                        >
                          {testTakers.map((taker, index) => (
                            <div
                              key={taker._id}
                              style={{
                                marginBottom:
                                  index < testTakers.length - 1 ? 8 : 0,
                              }}
                            >
                              <Text strong>{taker.name}</Text>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {sampleIdentifyNumbers &&
                                sampleIdentifyNumbers.length > 0 ? (
                                  sampleIdentifyNumbers
                                    .filter((_, i) => i % 2 === index % 2)
                                    .map((sampleId, i) => (
                                      <div key={i}>{sampleId}</div>
                                    ))
                                ) : (
                                  <Text type='secondary'>Không có mã mẫu</Text>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#999',
                                  marginTop: 4,
                                }}
                              >
                                {renderSampleNames(index)}
                              </div>
                            </div>
                          ))}
                        </Card>
                      )}
                      {(!testTakers || testTakers.length === 0) && (
                        <Card size='small' title='Người xét nghiệm & Mã mẫu'>
                          <Text type='secondary'>—</Text>
                        </Card>
                      )}
                      <Flex gap={8} style={{ marginTop: 12 }}>
                        <Dropdown
                          overlay={getStatusUpdateMenu(record)}
                          trigger={['click']}
                          disabled={!canUpdate}
                        >
                          <Button type='primary' disabled={!canUpdate}>
                            {canUpdate
                              ? 'Cập nhật trạng thái'
                              : 'Không thể cập nhật'}
                          </Button>
                        </Dropdown>
                        <Upload
                          beforeUpload={(file) =>
                            handleBeforeUpload(file, record)
                          }
                          showUploadList={false}
                          accept='image/*'
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={isUploading}
                          >
                            Upload ảnh
                          </Button>
                        </Upload>
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
              style={{ textAlign: 'center', paddingTop: 20 }}
              onChange={(page, size) => {
                setPageNumber(page)
                setPageSize(size || 10)
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} dịch vụ (${currentStatusName})`
              }
            />
          )}
        </>
      )}
      <Modal
        title='Xác nhận cập nhật trạng thái'
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
          setNewStatusId('')
        }}
        confirmLoading={isUpdating}
        okText='Xác nhận'
        cancelText='Hủy'
      >
        <div style={{ padding: '16px 0' }}>
          <p>
            <strong>Mã dịch vụ:</strong>{' '}
            {selectedServiceCase?._id.slice(-8).toUpperCase()}
          </p>
          <p>
            <strong>Trạng thái hiện tại:</strong>{' '}
            <Tag
              color={getStatusColor(selectedServiceCase?.currentStatus || '')}
            >
              {selectedServiceCase?.currentStatus}
            </Tag>
          </p>
          <p>
            <strong>Trạng thái mới:</strong>{' '}
            <Tag color={getStatusColor(newStatusName)}>{newStatusName}</Tag>
          </p>
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
            }}
          >
            <strong>⚠️ Lưu ý:</strong> Việc cập nhật trạng thái không thể hoàn
            tác sau khi thực hiện!
          </div>
        </div>
      </Modal>

      {/* Modal de xac nhan anh muon upload */}
      <Modal
        title='Xác nhận tải ảnh lên'
        open={uploadModalVisible}
        onOk={handleImageUpload}
        onCancel={() => {
          setUploadModalVisible(false)
          setFileToUpload(null)
          setPreviewImage(null)
          setSelectedServiceCase(null)
        }}
        confirmLoading={isUploading}
        okText='Tải lên'
        cancelText='Hủy'
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p>
            Bạn có chắc chắn muốn tải ảnh này lên cho dịch vụ có mã{' '}
            <strong>{selectedServiceCase?._id}</strong> không?
          </p>
          {previewImage && (
            <img
              src={previewImage}
              alt='Preview'
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                marginTop: '16px',
                border: '1px solid #ddd',
              }}
            />
          )}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
            }}
          >
            <strong>⚠️ Lưu ý:</strong> Vui lòng đảm bảo đây là ảnh chính xác cần
            tải lên!
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SampleCollectorServiceCase
