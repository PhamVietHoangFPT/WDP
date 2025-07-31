import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export default function HeaderCus() {
  const navigate = useNavigate()
  const token = Cookies.get('userToken')
  const decoded = token ? jwtDecode<any>(token) : {}

  const items = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'manage-address',
      label: 'Quản lý địa chỉ',
      onClick: () => navigate('/manage-address'),
    },
    {
      key: 'list-testee',
      label: 'Danh sách người test ADN',
      onClick: () => navigate('/list-testee?pageNumber=1&pageSize=10'),
    },
    {
      key: 'create-testee',
      label: 'Tạo người test ADN',
      onClick: () => navigate('/create-testee'),
    },

    {
      key: 'payment-history',
      label: 'Lịch sử thanh toán',
      onClick: () => navigate('/payment-history?pageNumber=1&pageSize=5'),
    },
    {
      key: 'service-case-customer',
      label: 'Lịch sử trường hợp dịch vụ',
      onClick: () => navigate('/service-case-customer?pageNumber=1&pageSize=5'),
    },
  ]

  return (
    <div>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 24,
          paddingLeft: 24,
          marginBottom: 16,
          color: '#000',
        }}
      ></div>
      <Menu mode='vertical' items={items} defaultSelectedKeys={['profile']} />
    </div>
  )
}
