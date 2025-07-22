"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  Button,
  Input,
  Typography,
  Spin,
  Pagination,
  Popconfirm,
  Space,
  Form,
  Select,
  message,
  Card,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons"
import {
  useGetCustomerServiceCaseByEmailQuery,
  useGetAllStatusForCustomerQuery,
  // Giả định mày có mutation này để cập nhật trạng thái, nếu chưa có thì phải tự tạo
  // Ví dụ: useUpdateServiceCaseStatusMutation
} from "../../features/staff/staffAPI" // Thay đổi đường dẫn này cho đúng với project của mày

// Định nghĩa kiểu dữ liệu cho ServiceCase và Status dựa trên API response của mày
interface ServiceCase {
  _id: string
  created_at: string
  currentStatus: string // Là chuỗi, ví dụ: "Chờ thanh toán"
  bookingDate: string
  customerEmail?: string
  serviceName?: string
}

interface ServiceCaseResponse {
  data: ServiceCase[]
  success: boolean
  message: string
  statusCode: number
  pagination?: {
    totalItems: number
    pageSize: number
    totalPages: number
    currentPage: number
  }
}

interface Status {
  _id: string
  testRequestStatus: string // Tên trạng thái, ví dụ: "Chờ thanh toán"
  order: number
}

const { Title } = Typography
const { Option } = Select

const StaffGetServiceCaseByCustomer: React.FC = () => {
  const [form] = Form.useForm()
  const [customerEmail, setCustomerEmail] = useState<string>("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Lấy danh sách trạng thái từ API /test-request-status
  const {
    data: allStatuses,
    isLoading: isLoadingStatuses,
    isError: isErrorStatuses,
  } = useGetAllStatusForCustomerQuery({})

  // Lấy danh sách service cases của khách hàng theo email và status
  const {
    data: serviceCasesResponse,
    isLoading: isLoadingServiceCases,
    isFetching: isFetchingServiceCases,
    refetch,
  } = useGetCustomerServiceCaseByEmailQuery(
    {
      email: customerEmail,
      currentStatus: selectedStatusFilter,
      pageNumber: currentPage,
      pageSize: pageSize,
    },
    {
      skip: !customerEmail,
      refetchOnMountOrArgChange: true,
    },
  )

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const handleUpdateServiceCaseStatus = async ({ id, statusId }: { id: string; statusId: string }) => {
    setIsUpdatingStatus(true);
    try {
      // Thực hiện gọi API cập nhật trạng thái ở đây
      // Ví dụ: await updateServiceCaseStatus({ id, statusId }).unwrap();
      console.log(`Cập nhật trạng thái cho case ${id} thành ${statusId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success("Cập nhật trạng thái thành công (giả lập)!");
      refetch();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error(error.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  const handleSearch = () => {
    const values = form.getFieldsValue()
    setCustomerEmail(values.email)
    setSelectedStatusFilter(values.currentStatus || [])
    setCurrentPage(1)
  }

  const handleUpdateStatus = async (serviceCaseId: string, newStatusId: string) => {
    await handleUpdateServiceCaseStatus({ id: serviceCaseId, statusId: newStatusId });
  }

  const serviceCases = serviceCasesResponse?.data || [];
  const paginationData = serviceCasesResponse?.pagination;

  const columns: ColumnsType<ServiceCase> = [
    {
      title: "Email Khách Hàng",
      dataIndex: "customerEmail",
      key: "customerEmail",
      render: (text) => text || customerEmail,
    },
    {
      title: "Ngày Đặt Lịch",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: "Trạng Thái Hiện Tại",
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (text) => {
        let color = 'geekblue';
        switch (text) {
          case 'Chờ thanh toán': color = 'volcano'; break;
          case 'Đã thanh toán': color = 'blue'; break;
          case 'Check-in': color = 'cyan'; break;
          case 'Chờ xử lý': color = 'orange'; break;
          case 'Đang lấy mẫu': color = 'purple'; break;
          case 'Hoàn thành': color = 'green'; break;
          default: color = 'geekblue';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày Tạo Yêu Cầu",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => {
        let availableStatuses: Status[] = [];
        
        // Logic lọc trạng thái chỉ cho phép chuyển đổi từ "Đã thanh toán" -> "Check-in"
        // và từ "Check-in" -> "Chờ xử lý"
        if (record.currentStatus === "Đã thanh toán") {
          const checkinStatus = allStatuses?.find(s => s.testRequestStatus === "Check-in");
          if (checkinStatus) {
            availableStatuses.push(checkinStatus);
          }
        } else if (record.currentStatus === "Check-in") {
          const choXuLyStatus = allStatuses?.find(s => s.testRequestStatus === "Chờ xử lý");
          if (choXuLyStatus) {
            availableStatuses.push(choXuLyStatus);
          }
        }
        // Các trạng thái khác sẽ không có lựa chọn cập nhật.

        // Tìm _id của trạng thái hiện tại để set initialValue
        const currentStatusId = allStatuses?.find(s => s.testRequestStatus === record.currentStatus)?._id;

        // Nếu không có trạng thái nào để chuyển đến, hoặc không tìm thấy _id của trạng thái hiện tại, ẩn nút cập nhật
        if (!availableStatuses || availableStatuses.length === 0 || !currentStatusId) {
            return <Tag color="default">Không thể cập nhật</Tag>;
        }

        return (
          <Space size="middle">
            <Popconfirm
              title="Cập nhật trạng thái?"
              description={
                <Form
                  layout="vertical"
                  initialValues={{ newStatus: currentStatusId }}
                  onFinish={(values) => handleUpdateStatus(record._id, values.newStatus)}
                >
                  <Form.Item
                    name="newStatus"
                    label="Chọn trạng thái mới"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                  >
                    <Select
                      placeholder="Chọn trạng thái"
                      loading={isLoadingStatuses}
                      disabled={isLoadingStatuses || isErrorStatuses}
                    >
                      {availableStatuses.map((status: Status) => (
                        <Option key={status._id} value={status._id}>
                          {status.testRequestStatus}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" loading={isUpdatingStatus}>
                      Cập nhật
                    </Button>
                  </Form.Item>
                </Form>
              }
              okButtonProps={{ style: { display: "none" } }}
              cancelButtonProps={{ style: { display: "none" } }}
              placement="left"
            >
              <Button type="primary" icon={<ReloadOutlined />}>
                Cập nhật trạng thái
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý yêu cầu dịch vụ khách hàng</Title>

      <Card style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Form.Item
            name="email"
            label="Email Khách Hàng"
            rules={[
              { required: true, message: "Vui lòng nhập email khách hàng!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              placeholder="Nhập email khách hàng"
              prefix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item
            name="currentStatus"
            label="Lọc theo Trạng Thái"
          >
            <Select
              placeholder="Tất cả trạng thái"
              allowClear
              loading={isLoadingStatuses}
              disabled={isLoadingStatuses || isErrorStatuses}
            >
              {allStatuses?.map((status: Status) => (
                <Option key={status._id} value={status._id}>
                  {status.testRequestStatus}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {customerEmail && (
        <>
          {(isLoadingServiceCases || isFetchingServiceCases) ? (
            <Spin tip="Đang tải danh sách yêu cầu dịch vụ..." />
          ) : (
            <>
              <Table
                dataSource={serviceCases}
                columns={columns}
                rowKey="_id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />

              {paginationData && (
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={paginationData.totalItems || 0}
                  onChange={(page, size) => {
                    setCurrentPage(page)
                    setPageSize(size)
                  }}
                  showSizeChanger
                  showTotal={(total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} trong tổng số ${total} yêu cầu`
                  }
                  pageSizeOptions={["5", "10", "20"]}
                  style={{
                    marginTop: "20px",
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default StaffGetServiceCaseByCustomer;