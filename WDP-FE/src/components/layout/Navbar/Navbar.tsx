import React, { useState, useMemo, useEffect } from 'react'
import {
  LoginOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  HomeFilled,
} from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBlog } from '@fortawesome/free-solid-svg-icons'
import type { MenuProps } from 'antd'
import { Menu, Layout } from 'antd'
const { Header } = Layout
import { useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [current, setCurrent] = useState(() => {
    const path = location.pathname.split('/')[1] || 'home'
    return path
  })

  useEffect(() => {
    setCurrent(location.pathname.split('/')[1] || 'home')
  }, [location.pathname])

  const userData = Cookies.get('userData')
    ? JSON.parse(Cookies.get('userData') as string)
    : null
  const navigate = useNavigate()

  const mainMenuItems = useMemo(() => {
    // Bắt đầu với các mục bên trái
    const leftItems = [
      {
        key: 'home',
        icon: <HomeFilled style={{ fontSize: '16px' }} />,
        label: 'Trang chủ',
        url: '/',
      },
      {
        key: 'blogs',
        icon: <FontAwesomeIcon icon={faBlog} style={{ fontSize: '16px' }} />,
        label: 'Cẩm nang',
        url: '/blogs',
      },
    ]

    // Các mục bên phải
    const rightItems = [
      {
        key: 'kit',
        icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
        label: 'Lấy mẫu tại nhà',
        url: '/home-registeration',
        // ✅ THÊM DÒNG NÀY: Dòng này sẽ đẩy mục này và tất cả các mục sau nó sang hẳn bên phải
        style: { marginLeft: 'auto' },
      },

      {
        key: 'adminstrative-services',
        icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
        label: 'Dịch vụ hành chính',
        url: '/adminstrative-services',
      },

      {
        key: userData ? 'profile' : 'login',
        icon: userData ? <UserOutlined /> : <LoginOutlined />,
        label: userData ? 'Hồ sơ' : 'Đăng nhập / Đăng ký',
        url: userData ? '/profile' : '/login',
      },
      // Dùng toán tử spread để thêm mục Đăng xuất nếu đã đăng nhập
      ...(userData
        ? [
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Đăng xuất',
              style: { fontSize: '16px', color: 'red' },
              onClick: () => {
                Cookies.remove('userData')
                Cookies.remove('userToken')
                navigate('/login')
              },
            },
          ]
        : []),
    ]

    return [...leftItems, ...rightItems]
  }, [userData, navigate])

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    const findItem = (items: any[], key: string) => {
      for (const item of items) {
        if (item.key === key) return item
        if (item.children) {
          const found: any = findItem(item.children, key)
          if (found) return found
        }
      }
      return null
    }

    const allItems = mainMenuItems
    const item = findItem(allItems, e.key)
    if (item?.url) {
      navigate(item.url)
    }
    if (item?.onClick) {
      item.onClick()
    }
  }

  return (
    <Header
      style={{
        position: 'fixed', // ✅ Bám lên đầu màn hình
        top: 0,
        left: 0,
        width: '100%', // ✅ Đảm bảo full width
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
      }}
    >
      {/* Bỏ các div bao ngoài, chỉ cần một Menu duy nhất */}
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode='horizontal'
        items={mainMenuItems} // ✅ SỬ DỤNG MẢNG ĐÃ GỘP
        style={{
          borderBottom: 'none',
          lineHeight: '62px',
          flex: 1, // ✅ THÊM DÒNG NÀY: Cho phép menu chiếm toàn bộ chiều rộng
          minWidth: 0, // Cần thiết để flexbox co giãn đúng cách
        }}
      />
    </Header>
  )
}

export default Navbar
