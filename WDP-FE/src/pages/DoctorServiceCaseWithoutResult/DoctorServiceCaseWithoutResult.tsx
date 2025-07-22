'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Typography,
  Tag,
  Button,
  Select,
  Modal,
  message,
  Alert,
  Spin,
  Form,
  InputNumber,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import {
  useGetServiceCaseWithoutResultsListQuery,
  useGetAllRequestStatusListQuery,
  useUpdateServiceCaseStatusMutation,
  useGetTestTakerQuery,
  useCreateServiceCaseResultMutation,
} from '../../features/doctor/doctorAPI'
import Cookies from 'js-cookie'

const { Title } = Typography

interface ServiceCase {
  _id: string
  currentStatus: {
    _id: string
    testRequestStatus: string
    order: number
  }
  caseMember: {
    testTaker: string[]
  }
  bookingDate: string
  timeReturn: number
}

interface RequestStatus {
  _id: string
  testRequestStatus: string
  order: number
}

interface TestTaker {
  _id: string
  name: string
  personalId: string
  dateOfBirth: string
  account: {
    _id: string
    name: string
    email: string
  }
  gender: boolean
}

interface TestTakerNameProps {
  id: string
}

const TestTakerName: React.FC<TestTakerNameProps> = ({ id }) => {
  const {
    data: testTaker,
    isLoading,
    error,
  } = useGetTestTakerQuery(id, {
    skip: !id,
  })

  if (isLoading) {
    return <Spin size='small' />
  }

  if (error) {
    return (
      <span style={{ color: '#ff4d4f' }}>
        {id.slice(-8).toUpperCase()} (Lỗi tải tên)
      </span>
    )
  }

  return <span>{testTaker?.name || id.slice(-8).toUpperCase()}</span>
}

const DoctorServiceCaseWithoutResult: React.FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [resultExists, setResultExists] = useState<boolean>(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [createResultModalVisible, setCreateResultModalVisible] =
    useState(false)
  const [selectedServiceCase, setSelectedServiceCase] =
    useState<ServiceCase | null>(null)
  const [testTakerNames, setTestTakerNames] = useState<string[]>([])
  const [form] = Form.useForm()

  // THÊM STATE NÀY ĐỂ LƯU TRỮ TỶ LỆ ADN CHO VIỆC HIỂN THỊ PREVIEW
  const [adnPercentagePreview, setAdnPercentagePreview] = useState<
    number | null
  >(null)

  const { data: statusListData, isLoading: isLoadingStatus } =
    useGetAllRequestStatusListQuery({
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
    }
  )

  const doctorId = useMemo(() => {
    const userData = Cookies.get('userData')
    if (userData) {
      try {
        const doctorData = JSON.parse(decodeURIComponent(userData))
        return (doctorData as any).id
      } catch (error) {
        console.error('Lỗi khi parse userData từ Cookie:', error)
        return null
      }
    }
    return null
  }, [])

  const [updateServiceCaseStatus, { isLoading: isUpdating }] =
    useUpdateServiceCaseStatusMutation()
  const [createServiceCaseResult, { isLoading: isCreatingResult }] =
    useCreateServiceCaseResultMutation()

  useEffect(() => {
    if (statusListData?.data && !selectedStatus) {
      const defaultStatus = statusListData.data.find(
        (status: RequestStatus) => status.order === 6
      )
      if (defaultStatus) setSelectedStatus(defaultStatus._id)
    }
  }, [statusListData, selectedStatus])

  // Fetch test taker names when selectedServiceCase changes
  useEffect(() => {
    if (selectedServiceCase?.caseMember?.testTaker.length) {
      const fetchNames = async () => {
        const namesPromises = selectedServiceCase.caseMember.testTaker.map(
          async (id) => {
            const { data: testTaker, error } =
              await useGetTestTakerQuery(id).unwrap() // Using unwrap() to get the actual data or throw error
            if (error) {
              console.error(`Error fetching test taker ${id}:`, error)
              return id.slice(-8).toUpperCase()
            }
            return testTaker?.name || id.slice(-8).toUpperCase()
          }
        )
        try {
          const fetchedNames = await Promise.all(namesPromises)
          setTestTakerNames(fetchedNames)
        } catch (err) {
          console.error('Failed to fetch all test taker names:', err)
          setTestTakerNames(
            selectedServiceCase.caseMember.testTaker.map((id) =>
              id.slice(-8).toUpperCase()
            )
          ) // Fallback to IDs
        }
      }
      fetchNames()
    } else {
      setTestTakerNames([])
    }
  }, [selectedServiceCase]) // Dependency on selectedServiceCase

  const calculateDaysLeft = (bookingDate: string, timeReturn: number) => {
    const booking = new Date(bookingDate)
    const deadline = new Date(
      booking.getTime() + timeReturn * 24 * 60 * 60 * 1000
    )
    const now = new Date()
    const utcNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const utcDeadline = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    )
    const diffTime = utcDeadline.getTime() - utcNow.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0)
      return { days: diffDays, status: 'normal', text: `Còn ${diffDays} ngày` }
    if (diffDays === 0) return { days: 0, status: 'warning', text: 'Hôm nay' }
    return {
      days: diffDays,
      status: 'danger',
      text: `Quá hạn ${Math.abs(diffDays)} ngày`,
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedServiceCase) return
    try {
      let nextStatus
      if (selectedServiceCase.currentStatus.order === 6) {
        nextStatus = statusListData?.data?.find(
          (status: RequestStatus) => status.order === 7
        )
      } else if (selectedServiceCase.currentStatus.order === 7) {
        nextStatus = statusListData?.data?.find(
          (status: RequestStatus) => status.order === 8
        )
      } else {
        return message.error('Trạng thái hiện tại không thể cập nhật!')
      }
      if (!nextStatus)
        return message.error('Không tìm thấy trạng thái tiếp theo!')

      await updateServiceCaseStatus({
        id: selectedServiceCase._id,
        currentStatus: nextStatus._id,
      }).unwrap()

      message.success('Cập nhật trạng thái thành công!')
      setUpdateModalVisible(false)
      setSelectedServiceCase(null)
      refetchServiceCases()
    } catch (error: any) {
      console.error('Update status error:', error)
      message.error(
        error?.data?.message ||
          error?.statusText ||
          'Không thể kết nối đến máy chủ'
      )
      refetchServiceCases()
    }
  }

  const handleCreateResult = (serviceCase: ServiceCase) => {
    setSelectedServiceCase(serviceCase)
    setCreateResultModalVisible(true)
    form.resetFields()
    setAdnPercentagePreview(null) // Reset preview state
    setTestTakerNames([]) // Reset names to avoid stale data
  }

  const handleCreateResultSubmit = async () => {
    try {
      const values = await form.validateFields()

      const adnPercentage = parseFloat(values.adnPercentage)

      let conclusion = ''
      const testTakerNamesString = testTakerNames.join(' và ')

      if (testTakerNames.length === 0) {
        conclusion =
          'Không đủ thông tin người xét nghiệm để đưa ra kết luận cụ thể.'
      } else if (testTakerNames.length === 1) {
        conclusion = `${testTakerNames[0]} có kết quả xét nghiệm ADN là ${adnPercentage}%.`
      } else if (testTakerNames.length >= 2) {
        if (adnPercentage === 100) {
          conclusion = `${testTakerNamesString} là song sinh cùng trứng và có quan hệ huyết thống tuyệt đối.`
        } else if (adnPercentage >= 99.9) {
          conclusion = `${testTakerNamesString} có quan hệ huyết thống trực hệ (cha/mẹ - con) với xác suất ${adnPercentage}%.`
        } else if (adnPercentage >= 90) {
          conclusion = `${testTakerNamesString} có quan hệ anh chị em ruột với xác suất ${adnPercentage}%.`
        } else if (adnPercentage >= 70) {
          conclusion = `${testTakerNamesString} có quan hệ họ hàng gần (như ông bà-cháu, cô/chú/bác-cháu, hoặc anh chị em cùng cha/mẹ khác cha) với xác suất ${adnPercentage}%.`
        } else if (adnPercentage >= 50) {
          conclusion = `${testTakerNamesString} có quan hệ anh chị em họ đời thứ nhất với xác suất ${adnPercentage}%.`
        } else if (adnPercentage >= 30) {
          conclusion = `${testTakerNamesString} có quan hệ anh chị em họ đời thứ hai với xác suất ${adnPercentage}%.`
        } else if (adnPercentage >= 10) {
          conclusion = `${testTakerNamesString} có quan hệ anh chị em họ đời thứ ba với xác suất ${adnPercentage}%.`
        } else if (adnPercentage > 0.1) {
          conclusion = `${testTakerNamesString} có quan hệ họ hàng rất xa hoặc không đáng kể với xác suất ${adnPercentage}%.`
        } else {
          // 0% hoặc dưới 0.1%
          conclusion = `${testTakerNamesString} không có quan hệ huyết thống với xác suất ${adnPercentage}%.`
        }
      }

      const resultData = {
        adnPercentage: values.adnPercentage.toString(),
        doctorId: doctorId,
        conclusion: conclusion,
        serviceCase: selectedServiceCase?._id,
      }

      await createServiceCaseResult(resultData).unwrap()

      message.success('Tạo kết quả thành công!')
      setCreateResultModalVisible(false)
      setSelectedServiceCase(null)
      setTestTakerNames([])
      setAdnPercentagePreview(null) // Reset preview state after successful creation
      form.resetFields()
      refetchServiceCases()
    } catch (error: any) {
      console.error('Create result error:', error)
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại các trường nhập liệu.')
      } else {
        message.error(error?.data?.message || 'Tạo kết quả thất bại!')
      }
    }
  }

  const handleViewDetails = (id: string) => {
    message.info('Xem chi tiết: ' + id)
  }

  // Custom validator for ADN percentage
  const validateAdnPercentage = (_: any, value: number | string) => {
    if (value === null || value === undefined || value === '') {
      return Promise.reject(new Error('Vui lòng nhập tỷ lệ ADN!'))
    }

    const stringValue = String(value)

    if (stringValue.includes(',')) {
      return Promise.reject(
        new Error('Vui lòng sử dụng dấu chấm (.) làm dấu thập phân!')
      )
    }

    const numericValue = parseFloat(stringValue)

    if (isNaN(numericValue)) {
      return Promise.reject(new Error('Giá trị nhập vào không hợp lệ!'))
    }

    if (numericValue < 0 || numericValue > 100) {
      return Promise.reject(new Error('Tỷ lệ ADN phải từ 0 đến 100!'))
    }

    const fixedValueString = numericValue.toFixed(3)
    const decimalPart = fixedValueString.split('.')[1]
    const decimalPlaces = decimalPart ? decimalPart.length : 0

    if (decimalPlaces > 3) {
      return Promise.reject(
        new Error('Tỷ lệ ADN chỉ được có tối đa 3 chữ số thập phân!')
      )
    }

    return Promise.resolve()
  }

  const columns: ColumnsType<ServiceCase> = [
    {
      title: 'Mã dịch vụ',
      dataIndex: '_id',
      render: (id) => (
        <div
          style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' }}
        >
          {id}
        </div>
      ),
    },
    {
      title: 'Trạng thái hiện tại',
      key: 'currentStatus',
      render: (_, record) => (
        <Tag color={record.currentStatus.order === 7 ? 'blue' : 'orange'}>
          {record.currentStatus.testRequestStatus}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'bookingDate',
      key: 'bookingDate',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    },
    {
      title: 'Thời gian xử lý',
      key: 'timeReturn',
      render: (_, record) => {
        const daysInfo = calculateDaysLeft(
          record.bookingDate,
          record.timeReturn
        )
        const color =
          daysInfo.status === 'danger'
            ? '#ff4d4f'
            : daysInfo.status === 'warning'
              ? '#faad14'
              : '#52c41a'
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.timeReturn} ngày</div>
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
      title: 'Người xét nghiệm',
      key: 'testTaker',
      render: (_, record) => (
        <div>
          {record.caseMember.testTaker.map((takerId) => (
            <div key={takerId} style={{ fontSize: 12 }}>
              <TestTakerName id={takerId} />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        if (
          record.currentStatus.order === 7 ||
          record.currentStatus.order === 6
        ) {
          return (
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedServiceCase(record)
                setUpdateModalVisible(true)
              }}
              size='small'
            >
              Cập nhật
            </Button>
          )
        } else if (record.currentStatus.order === 8) {
          return (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => handleCreateResult(record)}
              size='small'
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Tạo kết quả
            </Button>
          )
        } else {
          return (
            <Button
              type='primary'
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record._id)}
              size='small'
            >
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
    statusListData?.data?.find((s) => s._id === selectedStatus)
      ?.testRequestStatus || ''

  const SelectionComponent = () => {
    return (
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value)
            setPageNumber(1)
          }}
          style={{ width: 200 }}
          placeholder='Chọn trạng thái'
          loading={isLoadingStatus}
          disabled={isLoadingStatus}
        >
          {statusListData?.data
            ?.filter((s) => s.order >= 6 && s.order <= 9)
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
    )
  }

  if (fetchError) {
    return (
      <div>
        <Title level={2}>Quản lý dịch vụ chưa có kết quả</Title>
        <SelectionComponent />
        <Alert
          message='Lỗi tải dữ liệu'
          description={`Đã xảy ra lỗi khi tải dữ liệu: ${
            (fetchError as any)?.status || 'Không xác định'
          } - ${
            (fetchError as any)?.data?.message ||
            (fetchError as any)?.error ||
            'Vui lòng thử lại sau.'
          }`}
          type='error'
          showIcon
          action={
            <Button size='small' danger onClick={refetchServiceCases}>
              Tải lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dịch vụ chưa có kết quả</Title>

      <SelectionComponent />

      {!selectedStatus && (
        <Alert
          message='Vui lòng chọn trạng thái'
          description='Hãy chọn một trạng thái từ danh sách trên để hiển thị dữ liệu.'
          type='info'
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ minHeight: '400px' }}>
        <Table
          dataSource={serviceCases}
          columns={columns}
          rowKey='_id'
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
                <div
                  style={{
                    fontSize: '18px',
                    color: '#999',
                    marginBottom: '8px',
                  }}
                >
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
      {/* Update Status Modal */}
      <Modal
        title='⚠️ Xác nhận cập nhật trạng thái'
        open={updateModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setSelectedServiceCase(null)
        }}
        confirmLoading={isUpdating}
        okText='Xác nhận'
        cancelText='Hủy'
        okButtonProps={{ danger: true }}
      >
        <p>
          <strong>Mã dịch vụ:</strong> {selectedServiceCase?._id}
        </p>
        <p>
          <strong>Trạng thái hiện tại:</strong>{' '}
          <Tag color='blue'>
            {selectedServiceCase?.currentStatus.testRequestStatus}
          </Tag>
        </p>
        <p>
          <strong>Trạng thái mới:</strong>{' '}
          <Tag color='orange'>
            {(() => {
              if (!selectedServiceCase || !statusListData?.data) return ''
              let nextStatus: RequestStatus | undefined
              if (selectedServiceCase.currentStatus.order === 6) {
                nextStatus = statusListData.data.find(
                  (status: RequestStatus) => status.order === 7
                )
              } else if (selectedServiceCase.currentStatus.order === 7) {
                nextStatus = statusListData.data.find(
                  (status: RequestStatus) => status.order === 8
                )
              }
              return nextStatus?.testRequestStatus || ''
            })()}
          </Tag>
        </p>
        <div
          style={{
            marginTop: 20,
            background: '#fff1f0',
            padding: 12,
            border: '1px solid #ffa39e',
            borderRadius: 6,
          }}
        >
          <strong style={{ color: '#cf1322' }}>Lưu ý:</strong> Hãy đảm bảo trạng
          thái cập nhật đúng. Hành động này không thể hoàn tác và bạn sẽ chịu
          trách nhiệm theo đúng pháp luật
        </div>
      </Modal>

      {/* Create Result Modal */}
      <Modal
        title='🧬 Tạo kết quả xét nghiệm ADN'
        open={createResultModalVisible}
        onOk={handleCreateResultSubmit}
        onCancel={() => {
          setCreateResultModalVisible(false)
          setSelectedServiceCase(null)
          setTestTakerNames([])
          setAdnPercentagePreview(null) // Reset preview state on cancel
          form.resetFields()
        }}
        confirmLoading={isCreatingResult}
        okText='Tạo kết quả'
        cancelText='Hủy'
        width={600}
      >
        {selectedServiceCase && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p>
                <strong>Mã dịch vụ:</strong> {selectedServiceCase._id}
              </p>
              <p>
                <strong>Người xét nghiệm:</strong>{' '}
                {selectedServiceCase.caseMember.testTaker.map(
                  (takerId, index) => (
                    <span key={takerId}>
                      <TestTakerName id={takerId} />
                      {index <
                        selectedServiceCase.caseMember.testTaker.length - 1 &&
                        ', '}
                    </span>
                  )
                )}
              </p>
              {/* Cập nhật phần hiển thị kết luận sẽ được tạo */}
              {testTakerNames.length > 0 && (
                <p>
                  <strong>Kết luận sẽ được tạo:</strong>{' '}
                  <em id='predicted-conclusion'>
                    {(() => {
                      // Sử dụng adnPercentagePreview thay vì form.getFieldValue
                      const adnValue = adnPercentagePreview
                      const namesString = testTakerNames.join(' và ')

                      if (testTakerNames.length === 0) {
                        return 'Không đủ thông tin người xét nghiệm để đưa ra kết luận cụ thể.'
                      } else if (testTakerNames.length === 1) {
                        return `${
                          testTakerNames[0]
                        } có kết quả xét nghiệm ADN là ${
                          adnValue !== null ? adnValue : '...'
                        }%.`
                      } else if (adnValue === null) {
                        return `${namesString} có quan hệ huyết thống... (vui lòng nhập tỷ lệ ADN)`
                      } else if (adnValue === 100) {
                        return `${namesString} là song sinh cùng trứng và có quan hệ huyết thống tuyệt đối.`
                      } else if (adnValue >= 99.9) {
                        return `${namesString} có quan hệ huyết thống trực hệ (cha/mẹ - con).`
                      } else if (adnValue >= 90) {
                        return `${namesString} có quan hệ anh chị em ruột.`
                      } else if (adnValue >= 70) {
                        return `${namesString} có quan hệ họ hàng gần (như ông bà-cháu, cô/chú/bác-cháu, hoặc anh chị em cùng cha/mẹ khác cha).`
                      } else if (adnValue >= 50) {
                        return `${namesString} có quan hệ anh chị em họ đời thứ nhất.`
                      } else if (adnValue >= 30) {
                        return `${namesString} có quan hệ anh chị em họ đời thứ hai.`
                      } else if (adnValue >= 10) {
                        return `${namesString} có quan hệ anh chị em họ đời thứ ba.`
                      } else if (adnValue > 0.1) {
                        return `${namesString} có quan hệ họ hàng rất xa hoặc không đáng kể.`
                      } else {
                        // 0% hoặc dưới 0.1%
                        return `${namesString} không có quan hệ huyết thống.`
                      }
                    })()}
                  </em>
                </p>
              )}
            </div>

            <Form
              form={form}
              layout='vertical'
              onValuesChange={(_, allValues) => {
                // CẬP NHẬT STATE adnPercentagePreview MỖI KHI GIÁ TRỊ THAY ĐỔI
                setAdnPercentagePreview(allValues.adnPercentage)
              }}
            >
              <Form.Item
                label='Tỷ lệ ADN (%)'
                name='adnPercentage'
                rules={[{ validator: validateAdnPercentage }]}
                help='Nhập tỷ lệ ADN từ 0 đến 100, tối đa 3 chữ số thập phân (VD: 99.999)'
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Nhập tỷ lệ ADN (VD: 99.999)'
                  min={0}
                  max={100}
                  step={0.001}
                  precision={3}
                />
              </Form.Item>
            </Form>

            <div
              style={{
                marginTop: 20,
                background: '#f6ffed',
                padding: 12,
                border: '1px solid #b7eb8f',
                borderRadius: 6,
              }}
            >
              <strong style={{ color: '#389e0d' }}>
                📋 Thông tin kết quả:
              </strong>
              <ul
                style={{
                  margin: '8px 0',
                  paddingLeft: '20px',
                  color: '#389e0d',
                }}
              >
                <li>Tỷ lệ ADN sẽ được lưu dưới dạng chuỗi</li>
                <li>Kết luận được tạo tự động từ tên người xét nghiệm</li>
                <li>Bác sĩ thực hiện sẽ được ghi nhận từ tài khoản hiện tại</li>
              </ul>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default DoctorServiceCaseWithoutResult
