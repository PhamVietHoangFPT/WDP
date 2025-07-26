'use client'

import React, { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  notification,
  Popconfirm,
  Spin,
  Space,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
  useGetManagerListQuery,
  useCreateManagerMutation,
  useDeleteManagerMutation,
  useUnAssignManagerMutation,
} from '../../features/admin/managerAPI' // Đảm bảo đường dẫn API chính xác

const { Option } = Select
const { Title } = Typography

// Định nghĩa kiểu dữ liệu cho Manager
interface Manager {
  _id: string
  name: string
  email: string
  phoneNumber: string
  role: string
  facility?: string // Optional, vì manager có thể chưa được gán
}

// Định nghĩa kiểu dữ liệu cho Form tạo Manager mới
interface CreateManagerFormValues {
  name: string
  email: string
  phoneNumber: string
  gender: boolean // true cho nam, false cho nữ
  password: string // Thêm trường password vào đây
}

export default function AdminManagerList() {
  // Lấy danh sách manager
  const {
    data: managersData,
    isLoading: isManagersLoading,
    error: managersError,
    refetch,
  } = useGetManagerListQuery(null)
  const managers: Manager[] = managersData?.data || []

  // Mutation để tạo, xóa, unassign manager
  const [createManager, { isLoading: isCreatingManager }] =
    useCreateManagerMutation()
  const [deleteManager, { isLoading: isDeletingManager }] =
    useDeleteManagerMutation()
  const [unAssignManager, { isLoading: isUnAssigningManager }] =
    useUnAssignManagerMutation()

  // State cho Modal tạo manager
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [createForm] = Form.useForm()

  const showCreateModal = () => {
    setIsCreateModalVisible(true)
  }

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false)
    createForm.resetFields()
  }

  const handleCreateManager = async (values: CreateManagerFormValues) => {
    try {
      // Bỏ hoàn toàn role ID hardcode ở đây. API sẽ tự gán hoặc không cần.
      await createManager({ data: values }).unwrap()

      notification.success({
        message: 'Tạo Manager thành công',
        description: `Manager "${values.name}" đã được tạo.`,
      })
      setIsCreateModalVisible(false)
      createForm.resetFields()
      refetch() // Tải lại danh sách manager
    } catch (error: any) {
      console.error('Failed to create manager:', error)
      notification.error({
        message: 'Tạo Manager thất bại',
        description:
          error?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      })
    }
  }

  const handleDeleteManager = async (manager: Manager) => {
    Modal.confirm({
      title: 'Xác nhận xóa Manager',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          Mày có chắc chắn muốn xóa manager **{manager.name}** không?
          {manager.facility && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              Manager này hiện đang được gán cho một cơ sở. Nếu xóa, manager sẽ
              tự động được unassign khỏi cơ sở đó.
            </p>
          )}
        </>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Nếu manager đang được gán cho facility, unassign trước
          if (manager.facility) {
            await unAssignManager({
              facilityId: manager.facility,
              managerId: manager._id,
            }).unwrap()
            notification.info({
              message: 'Unassign Manager',
              description: `Manager ${manager.name} đã được unassign khỏi cơ sở.`,
            })
          }

          // Xóa manager
          await deleteManager(manager._id).unwrap()
          notification.success({
            message: 'Xóa Manager thành công',
            description: `Manager "${manager.name}" đã được xóa.`,
          })
          refetch() // Tải lại danh sách manager
        } catch (error: any) {
          console.error('Failed to delete manager:', error)
          notification.error({
            message: 'Xóa Manager thất bại',
            description:
              error?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })
        }
      },
    })
  }

  // Định nghĩa cột cho bảng Ant Design
  const columns: ColumnsType<Manager> = [
    {
      title: 'Tên Manager',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Cơ sở quản lý',
      dataIndex: 'facility',
      key: 'facility',
      render: (facilityId?: string) => (facilityId ? 'Đã gán' : 'Chưa gán'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Popconfirm
            title='Xác nhận xóa?'
            onConfirm={() => handleDeleteManager(record)}
            okText='Xóa'
            cancelText='Hủy'
            placement='topRight'
            disabled={isDeletingManager || isUnAssigningManager}
          >
            <Button
              type='primary'
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingManager || isUnAssigningManager}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (isManagersLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size='large' tip='Đang tải danh sách Manager...' />
      </div>
    )
  }

  if (managersError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
        <p>
          Lỗi khi tải danh sách Manager:{' '}
          {managersError.message || JSON.stringify(managersError.data)}
        </p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Managers</Title>

      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={showCreateModal}
        style={{ marginBottom: 16 }}
      >
        Tạo Manager mới
      </Button>

      <Table
        columns={columns}
        dataSource={managers}
        rowKey='_id'
        loading={isManagersLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title='Tạo Manager mới'
        visible={isCreateModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
      >
        <Form
          form={createForm}
          layout='vertical'
          onFinish={handleCreateManager}
        >
          <Form.Item
            name='name'
            label='Họ và tên'
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder='Nguyễn Văn A' />
          </Form.Item>
          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder='example@gmail.com' />
          </Form.Item>
          <Form.Item
            name='phoneNumber'
            label='Số điện thoại'
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              {
                pattern: /^[0-9]{10,11}$/,
                message: 'Số điện thoại không hợp lệ!',
              },
            ]}
          >
            <Input placeholder='09xxxxxxxx' />
          </Form.Item>
          {/* Thêm trường Password */}
          <Form.Item
            name='password'
            label='Mật khẩu'
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
            hasFeedback // Hiển thị trạng thái validation
          >
            <Input.Password placeholder='Nhập mật khẩu' />
          </Form.Item>
          <Form.Item
            name='gender'
            label='Giới tính'
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select placeholder='Chọn giới tính'>
              <Option value={true}>Nam</Option>
              <Option value={false}>Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={isCreatingManager}
              block
            >
              Tạo Manager
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
