import { useState } from 'react' // Thêm useEffect
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Input, Avatar, Button, Tooltip, Divider } from 'antd' // Thêm Spin
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  UnorderedListOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import Cookies from 'js-cookie'
import type { UserData } from '../../../types/auth'

const { Sider } = Layout
const { Search } = Input

export const SideBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  // Lấy userData từ cookie và decode nó
  const userDataString = Cookies.get('userData')
  let userData: UserData | undefined
  if (userDataString) {
    try {
      // Decode URI component trước khi parse JSON
      userData = JSON.parse(decodeURIComponent(userDataString))
    } catch (error) {
      console.error('Lỗi khi parse userData từ cookie:', error)
    }
  }

  // Get the current selected keys based on the pathname
  const getSelectedKeys = () => {
    const pathname = location.pathname
    if (pathname === '/manager') return ['manager'] // Điều chỉnh để khớp với path chính của Manager

    // Check if pathname includes any of these paths
    const paths = ['samples', 'service-cases-without-doctor', 'create-account']

    for (const path of paths) {
      if (pathname.includes(path)) {
        // If it's a sub-path, return both parent and child keys
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length > 1) {
          return [path, pathname.substring(1)] // Remove leading slash
        }
        return [path]
      }
    }

    return []
  }

  // Define the menu items
  const items = [
    {
      key: 'manager',
      icon: <BarChartOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('manager'),
    },
    {
      key: 'manager/samples',
      icon: <ExperimentOutlined />,
      label: 'Dịch vụ chưa có nhân viên lấy mẫu',
      onClick: () => navigate('manager/samples'),
    },
    {
      key: 'manager/service-cases-without-doctor',
      icon: <UnorderedListOutlined />,
      label: 'Dịch vụ chưa có bác sĩ',
      onClick: () => navigate('manager/service-cases-without-doctor'),
    },
    {
      key: 'manager/service-cases-without-delivery-staff',
      icon: <UnorderedListOutlined />,
      label: 'Dịch vụ có chưa nhân viên giao hàng ',
      onClick: () => navigate('manager/service-cases-without-delivery-staff'),
    },
    {
      key: 'manager/kit-shipment-without-delivery-staff',
      icon: <UnorderedListOutlined />,
      label: 'Quản trị dịch vụ tự lấy mẫu tại nhà',
      onClick: () => navigate('manager/kit-shipment-without-delivery-staff'),
    },
    {
      key: 'manager/create-account',
      icon: <IdcardOutlined />,
      label: 'Quản trị tài khoản',
      onClick: () => navigate('manager/create-account'),
    },
  ]

  return (
    <Sider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme='light'
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {/* Logo and Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MedicineBoxOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          {!collapsed && (
            <span style={{ marginLeft: 12, fontWeight: 600 }}>VacciTrack</span>
          )}
        </div>
        {!collapsed && (
          <Button
            type='text'
            icon={<MenuFoldOutlined />}
            onClick={() => setCollapsed(true)}
            size='small'
          />
        )}
        {collapsed && (
          <Button
            type='text'
            icon={<MenuUnfoldOutlined />}
            onClick={() => setCollapsed(false)}
            size='small'
            style={{ marginTop: 16 }}
          />
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '12px 16px' }}>
          <Search
            placeholder='Search...'
            allowClear
            size='middle'
            prefix={<SearchOutlined />}
          />
        </div>
      )}

      {/* Navigation Menu */}
      <Menu
        mode='inline'
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={
          getSelectedKeys().length > 0 ? [getSelectedKeys()[0]] : []
        }
        style={{ borderRight: 0 }}
        items={items}
      />

      {/* User Profile */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: collapsed ? 0 : 12,
          }}
        >
          <Avatar icon={<UserOutlined />} />
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'black' }}>
                {/* Sửa userData?.Name thành userData?.name để khớp với cookie */}
                {userData?.name || 'Manager User'}
              </div>
              <div style={{ fontSize: 12, color: 'black' }}>
                {/* Sửa userData?.Email thành userData?.email để khớp với cookie */}
                {userData?.email || 'manager@vaccitrack.com'}
              </div>
              <div style={{ fontSize: 12, color: 'gray', marginTop: 4 }}>
                {userData?.facility?.facilityName || 'No Facility'}
              </div>
            </div>
          )}
        </div>
        {!collapsed && <Divider style={{ margin: '12px 0' }} />}
        <Tooltip title={collapsed ? 'Logout' : ''} placement='right'>
          <Button
            type='primary'
            danger
            icon={<LogoutOutlined />}
            onClick={() => {
              Cookies.remove('userData')
              Cookies.remove('userToken')
              navigate('/login')
            }}
            style={{ width: collapsed ? '100%' : '100%' }}
            size={collapsed ? 'middle' : 'middle'}
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </Tooltip>
      </div>
    </Sider>
  )
}
