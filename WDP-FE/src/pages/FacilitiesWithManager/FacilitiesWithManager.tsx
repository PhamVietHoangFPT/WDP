"use client"

import React, { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  notification,
  Popconfirm,
  Spin,
  Space,
  Typography,
  Select,
  Dropdown,
  Menu,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { FilterOutlined, DownOutlined, UserAddOutlined, UserDeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import {
  useGetFacilitiesWithManagerListQuery,
  useGetManagerListQuery,
  useAssignManagerMutation,
  useUnAssignManagerMutation,
} from '../../features/admin/managerAPI' // Đảm bảo đường dẫn API chính xác

const { Title } = Typography
const { Option } = Select

// Định nghĩa kiểu dữ liệu cho Address
interface Address {
  _id: string;
  fullAddress: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

// Định nghĩa kiểu dữ liệu cho Manager (đầy đủ hơn để hiển thị tên)
interface Manager {
  _id: string
  name: string
  email: string
  phoneNumber?: string // Có thể có hoặc không tùy vào response của get all managers
  role?: string // Có thể có hoặc không
  facility?: string // ID của facility mà manager đang quản lý (nếu có)
}

// Định nghĩa kiểu dữ liệu cho Facility, cập nhật 'account'
interface Facility {
  _id: string
  facilityName: string
  address: Address
  phoneNumber: string
  account: Manager | null // Cập nhật: 'account' giờ là một đối tượng Manager hoặc null
}

export default function FacilitiesWithManager() {
    const navigate = useNavigate()
  // State để lọc facility: true (có manager), false (chưa có manager), undefined (tất cả)
  const [withManagerFilter, setWithManagerFilter] = useState<boolean | undefined>(false) // Mặc định là chưa có manager

  // Lấy danh sách facilities dựa trên filter
  const {
    data: facilitiesData,
    isLoading: isFacilitiesLoading,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useGetFacilitiesWithManagerListQuery({ withManager: withManagerFilter })

  const facilities: Facility[] = facilitiesData?.data || []

  // Lấy danh sách managers (để hiển thị trong dropdown gán)
  const { data: managersData, isLoading: isManagersLoading, error: managersError, refetch: refetchManagers } = useGetManagerListQuery(null)
  const managers: Manager[] = managersData?.data || []

  // Mutations
  const [assignManager, { isLoading: isAssigningManager }] = useAssignManagerMutation()
  const [unAssignManager, { isLoading: isUnAssigningManager }] = useUnAssignManagerMutation()

  // Xử lý gán Manager
  const handleAssignManager = async (facilityId: string, managerId: string) => {
    try {
      await assignManager({ facilityId, managerId }).unwrap()
      notification.success({
        message: 'Gán Manager thành công',
        description: 'Manager đã được gán vào cơ sở.',
      })
      refetchFacilities() // Cập nhật lại danh sách facilities
      refetchManagers() // Cập nhật lại danh sách managers (để loại bỏ manager đã gán khỏi dropdown)
    } catch (error: any) {
      console.error('Failed to assign manager:', error)
      notification.error({
        message: 'Gán Manager thất bại',
        description: error?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
      })
    }
  }

  // Xử lý gỡ Manager
  const handleUnAssignManager = async (facility: Facility) => {
    // Bây giờ facility.account là một đối tượng Manager hoặc null
    if (!facility.account || !facility.account._id) { // Kiểm tra cả facility.account và facility.account._id
      notification.warn({
        message: 'Không thể gỡ',
        description: 'Cơ sở này không có manager nào được gán.',
      })
      return
    }

    Modal.confirm({
      title: 'Xác nhận gỡ Manager',
      icon: <ExclamationCircleOutlined />,
      content: `Mày có chắc chắn muốn gỡ manager "${facility.account.name}" khỏi cơ sở "${facility.facilityName}" không?`,
      okText: 'Gỡ',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await unAssignManager({ facilityId: facility._id, managerId: facility.account!._id }).unwrap() // Lấy _id từ facility.account
          notification.success({
            message: 'Gỡ Manager thành công',
            description: `Manager "${facility.account!.name}" đã được gỡ khỏi cơ sở "${facility.facilityName}".`,
          })
          refetchFacilities() // Cập nhật lại danh sách facilities
          refetchManagers() // Cập nhật lại danh sách managers (để manager đó có thể được gán lại)
        } catch (error: any) {
          console.error('Failed to unassign manager:', error)
          notification.error({
            message: 'Gỡ Manager thất bại',
            description: error?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })
        }
      },
    })
  }

  // Tạo menu dropdown cho managers chưa được gán
  const getUnassignedManagersMenu = (facilityId: string) => {
    const unassignedManagers = managers.filter(manager => !manager.facility)

    if (unassignedManagers.length === 0) {
      return (
        <Menu
          items={[
            {
              key: 'no-managers',
              label: (
                <span style={{ color: '#999' }}>Không có manager nào khả dụng</span>
              ),
              disabled: true,
            },
          ]}
        />
      )
    }

    return (
      <Menu
        items={unassignedManagers.map((manager: Manager) => ({
          key: manager._id,
          label: (
            <div
              onClick={() => handleAssignManager(facilityId, manager._id)}
              style={{ padding: '5px 12px' }}
            >
              <div style={{ fontWeight: 'bold' }}>{manager.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{manager.email}</div>
            </div>
          ),
        }))}
      />
    )
  }

  // Định nghĩa cột cho bảng Ant Design
  const columns: ColumnsType<Facility> = [
    {
      title: 'Tên Cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_, record) => record.address?.fullAddress || 'N/A',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Manager', // Đổi tên cột cho rõ ràng hơn
      key: 'managerName',
      // Render: Hiển thị tên manager nếu có, ngược lại là "Chưa gán"
      render: (_, record) => (record.account ? record.account.name : 'Chưa gán'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.account ? ( // Nếu đã có manager
            <Button
              type="primary"
              danger
              icon={<UserDeleteOutlined />}
              onClick={() => handleUnAssignManager(record)}
              loading={isUnAssigningManager}
            >
              Gỡ Manager
            </Button>
          ) : ( // Nếu chưa có manager
            <Dropdown
              overlay={getUnassignedManagersMenu(record._id)}
              trigger={['click']}
              // Vô hiệu hóa nút gán nếu đang xử lý hoặc không có manager nào chưa gán
              disabled={isAssigningManager || isManagersLoading || (managers.filter(m => !m.facility)).length === 0}
            >
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                loading={isAssigningManager || isManagersLoading}
              >
                Gán Manager <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </Space>
      ),
    },
  ]

  if (isFacilitiesLoading || isManagersLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  if (facilitiesError || managersError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
        <p>Lỗi khi tải dữ liệu:</p>
        {facilitiesError && <p>Facilities: {facilitiesError.message || JSON.stringify(facilitiesError.data)}</p>}
        {managersError && <p>Managers: {managersError.message || JSON.stringify(managersError.data)}</p>}
        <Button onClick={() => { navigate('/admin') }}>Quay lại trang Admin</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Cơ sở & Managers</Title>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FilterOutlined />
        <span>Lọc theo trạng thái Manager:</span>
        <Select
          value={withManagerFilter}
          onChange={setWithManagerFilter}
          style={{ width: 200 }}
          allowClear // Cho phép xóa lựa chọn để hiển thị tất cả
        >
          <Option value={false}>Chưa có Manager</Option>
          <Option value={true}>Đã có Manager</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={facilities}
        rowKey="_id"
        loading={isFacilitiesLoading || isManagersLoading || isAssigningManager || isUnAssigningManager}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}