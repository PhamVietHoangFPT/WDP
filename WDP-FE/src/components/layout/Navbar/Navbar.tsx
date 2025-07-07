import React, { useState, useMemo, useEffect } from 'react'
import {
  LoginOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  HomeFilled,
  SmileOutlined,
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

  const items = useMemo(() => {
    return [
      {
        key: 'home',
        icon: <HomeFilled style={{ fontSize: '16px' }} />,
        label: 'Trang chủ',
        style: { fontSize: '16px', color: '#616161' },
        url: '/',
      },
      // {
      //   key: 'services',
      //   icon: <SmileOutlined style={{ fontSize: '16px' }} />,
      //   label: 'Dịch vụ',
      //   style: { fontSize: '16px', color: '#616161' },
      //   url: '/vaccines?pageNumber=1',
      // },
      {
        key: 'booking',
        icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
        label: 'Đặt chỗ',
        style: { fontSize: '16px', color: '#616161' },
        url: '/booking',
      },
      {
        key: 'blogs',
        icon: <FontAwesomeIcon icon={faBlog} style={{ fontSize: '16px' }} />,
        label: 'Cẩm nang',
        style: { fontSize: '16px', color: '#616161' },
        url: '/blogs',
      },
    ]
  }, [])

  const userItems = useMemo(() => {
    return [
      {
        key: 'adn-at-facility',
        icon: <SmileOutlined style={{ fontSize: '16px' }} />,
        label: 'Dịch vụ hành chính',
        style: { fontSize: '16px', color: '#616161' },
        url: '/register-service',
      },
      {
        key: 'kit',
        icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
        label: 'Lấy mẫu tại nhà',
        style: { fontSize: '16px', color: '#616161' },
        url: '/home-registeration',
      },
      {
        key: userData ? 'profile' : 'login',
        icon: userData ? (
          <UserOutlined style={{ fontSize: '16px' }} />
        ) : (
          <LoginOutlined style={{ fontSize: '16px' }} />
        ),
        label: userData ? 'Hồ sơ' : 'Đăng nhập / Đăng ký',
        style: { fontSize: '16px', color: '#616161' },
        url: userData ? '/profile' : '/login',
      },
      ...(userData
        ? [
            {
              key: 'logout',
              icon: <LogoutOutlined style={{ fontSize: '16px' }} />,
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

    const allItems = [...items, ...userItems]
    const item = findItem(allItems, e.key)
    if (item?.url) {
      navigate(item.url)
    }
    if (item?.onClick) {
      item.onClick()
    }
  }

  return (
    <Header style={{ background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode='horizontal'
          items={items}
          style={{ flex: '7', borderBottom: 'none' }}
        />
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode='horizontal'
          items={userItems}
          style={{ flex: '3', borderBottom: 'none' }}
        />
      </div>
    </Header>
  )
}

export default Navbar
