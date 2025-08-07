import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  message,
  Input,
  Select,
  Popconfirm,
  Space,
  Typography,
  Card,
  Spin,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  useGetRoleListQuery,
  useGetStaffListQuery,
  useDeleteAccountMutation,
} from '../../features/manager/createAccountAPI'

const { Title } = Typography
const { Search } = Input

export default function ManagerAccountList() {
  const navigate = useNavigate()
  const [emailFilter, setEmailFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [debouncedEmail, setDebouncedEmail] = useState('')

  const { data: rolesData, isLoading: isRoleLoading } = useGetRoleListQuery({
    pageNumber: 1,
    pageSize: 100,
  })
  const {
    data: staffsData,
    isLoading: isStaffLoading,
    refetch,
  } = useGetStaffListQuery({
    email: debouncedEmail || undefined,
    role: roleFilter || undefined,
  })
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(emailFilter)
    }, 500)

    return () => clearTimeout(timer)
  }, [emailFilter])

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount(accountId).unwrap()
      message.success('Xóa tài khoản thành công.')
      refetch()
    } catch (error) {
      console.error('Error deleting account:', error)
      message.error('Xóa tài khoản thất bại.')
    }
  }

  const handleCreateAccount = () => {
    navigate('/manager/account/create')
  }

  const roles = rolesData?.data || []
  const staffs = staffsData?.data?.filter((staff) => staff.deleted_at === null) || []

  const columns = [
    {
      title: 'Tên',
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
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Popconfirm
          title='Xác nhận xóa'
          description='Bạn có chắc chắn muốn xóa tài khoản này?'
          onConfirm={() => handleDelete(record._id)}
          okText='Đồng ý'
          cancelText='Hủy'
        >
          <Button danger loading={isDeleting}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className='p-6'>
      <Card>
        <div style={{ padding: '24px' }}>
          <Title level={3}>Danh sách nhân viên</Title>
          <Space
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <Space>
              <Search
                placeholder='Tìm kiếm theo email...'
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                onSearch={() => setDebouncedEmail(emailFilter)}
                style={{ width: 250 }}
              />
              <Select
                placeholder='Chọn vai trò'
                style={{ width: 200 }}
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
              >
                <Select.Option value=''>Tất cả vai trò</Select.Option>
                {roles.map((role: any) => (
                  <Select.Option key={role._id} value={role._id}>
                    {role.role}
                  </Select.Option>
                ))}
              </Select>
            </Space>
            <div>
              <Button
                type='primary'
                onClick={handleCreateAccount}
                icon={<PlusOutlined />}
              >
                Tạo tài khoản
              </Button>
            </div>
          </Space>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <Spin spinning={isStaffLoading}>
            <Table
              columns={columns}
              dataSource={staffs}
              rowKey='_id'
              locale={{ emptyText: 'Không có nhân viên nào' }}
              pagination={false}
            />
          </Spin>
        </div>
      </Card>
    </div>
  )
}