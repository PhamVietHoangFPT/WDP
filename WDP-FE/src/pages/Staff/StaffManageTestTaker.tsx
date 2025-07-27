import { useMemo, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
  Tooltip,
  Card,
  Modal, // Thêm Modal
  Form, // Thêm Form
  Input, // Thêm Input
  DatePicker, // Thêm DatePicker
  Radio, // Thêm Radio
  List,
  Divider,
  Pagination,
  Spin,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import Cookies from 'js-cookie'
// Import các hooks từ file API của bạn
import {
  useGetTestTakersQuery,
  useDeleteTestTakerMutation,
  useCreateTestTakerMutation,
} from '../../features/customer/testTakerApi'

// Cấu hình dayjs để hiển thị thời gian tương đối bằng tiếng Việt
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Title } = Typography

// Định nghĩa kiểu dữ liệu cho TestTaker (nên có một file types riêng)
interface TestTaker {
  _id: string
  name: string
  personalId: string
  dateOfBirth: string
  created_at: string
}

export default function StaffManageTestTaker() {
  // State để quản lý phân trang
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  })

  const userData = Cookies.get('userData')
  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {}
  console.log(parsedUserData.id)
  const accountId = parsedUserData.id

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Gọi API để lấy danh sách
  const { data, isLoading, isFetching } = useGetTestTakersQuery({
    accountId,
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  })

  // Hook mutation để xóa
  const [deleteTestTaker, { isLoading: isDeleting }] =
    useDeleteTestTakerMutation()
  const [createTestTaker, { isLoading: isCreating }] =
    useCreateTestTakerMutation()

  const handleDelete = async (id: string) => {
    try {
      await deleteTestTaker(id).unwrap()
      message.success('Xóa thành công!')
    } catch (error) {
      message.error('Xóa thất bại. Vui lòng thử lại.')
    }
  }
  const handleCreate = async (values: any) => {
    const newTestTakerData = {
      ...values,
      dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      account: accountId,
    }

    try {
      await createTestTaker(newTestTakerData).unwrap()
      message.success('Tạo mới thành công!')
      setIsModalOpen(false) // Đóng modal
      form.resetFields() // Xóa các trường trong form
    } catch (error) {
      message.error('Tạo mới thất bại!')
    }
  }

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination)
  }

  const groupedData = useMemo(() => {
    if (!data?.data) return []

    // Dùng reduce để gom các item có cùng ngày tạo vào một nhóm
    const groups = data.data.reduce(
      (acc, item) => {
        const date = dayjs(item.created_at).format('YYYY-MM-DD')
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(item)
        return acc
      },
      {} as Record<string, TestTaker[]>
    )

    // Chuyển object thành mảng và sắp xếp theo ngày mới nhất
    return Object.entries(groups)
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
  }, [data])

  const columns: ColumnsType<TestTaker> = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CCCD/Mã định danh',
      dataIndex: 'personalId',
      key: 'personalId',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('HH:mm DD/MM/YYYY')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record: TestTaker) => (
        <Space size='middle'>
          <Popconfirm
            title='Xác nhận xử lý hồ sơ ?'
            description='Bạn có chắc muốn xác nhận xử lý hồ sơ người này không? Hành động này không thể hoàn tác.'
            onConfirm={() => handleDelete(record._id)}
            okText='Xử lý hồ sơ'
            cancelText='Hủy'
          >
            <Tooltip title='Xử lý hồ sơ'>
              <Button danger loading={isDeleting}>
                Đã xử lý hồ sơ
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const innerTableColumns = columns.filter((col) => col.key !== 'created_at')

  const disabledDate = (current) => {
    // Trả về true (vô hiệu hóa) cho những ngày sau ngày hôm nay
    return current && current > dayjs().endOf('day')
  }

  if (isLoading || isFetching) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh', // Đảm bảo div có chiều cao để căn giữa
        }}
      >
        <Spin size='large' />
      </div>
    )
  }

  return (
    <Card>
      <Title level={4}>Quản lý Người Xét nghiệm</Title>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => setIsModalOpen(true)} // Mở modal khi click
      >
        Thêm mới
      </Button>
      <List
        dataSource={groupedData}
        renderItem={(group) => (
          <div key={group.date} style={{ marginBottom: 24 }}>
            <Divider orientation='left' style={{ fontWeight: 'bold' }}>
              Ngày tạo: {dayjs(group.date).format('dddd, DD/MM/YYYY')}
            </Divider>
            <Table
              columns={innerTableColumns}
              dataSource={group.items}
              rowKey='_id'
              pagination={false} // Rất quan trọng: Tắt phân trang của bảng con
              bordered
            />
          </div>
        )}
      />
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={data?.pagination?.totalItems}
          onChange={(page, pageSize) =>
            handleTableChange({ current: page, pageSize })
          }
          showSizeChanger
        />
      </div>
      <Modal
        title='Tạo hồ sơ người xét nghiệm'
        open={isModalOpen}
        onOk={() => form.submit()} // Khi bấm OK, submit form
        onCancel={() => setIsModalOpen(false)} // Khi bấm Cancel, đóng modal
        confirmLoading={isCreating} // Hiển thị loading trên nút OK
      >
        <Form form={form} layout='vertical' onFinish={handleCreate}>
          <Form.Item
            name='name'
            label='Họ và tên'
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='personalId'
            label='CCCD/Mã định danh'
            rules={[{ required: true, message: 'Vui lòng nhập CCCD!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='gender'
            label='Giới tính'
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Radio.Group>
              <Radio value={true}>Nam</Radio>
              <Radio value={false}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name='dateOfBirth'
            label='Ngày sinh'
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format='DD/MM/YYYY'
              disabledDate={disabledDate} // ✅ Thêm prop vào đây
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
