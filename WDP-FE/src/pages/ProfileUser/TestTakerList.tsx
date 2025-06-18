// src/pages/TestTakerList.tsx
import {
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Typography,
  Tag,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  useDeleteTestTakerMutation,
  useGetTestTakersQuery,
} from '../../features/customer/testTakerApi'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import HeaderCus from '../../components/layout/Header/HeaderCus'

const { Title } = Typography

export default function TestTakerList() {
  const token = Cookies.get('userToken')
  const decoded: any = jwtDecode(token || '')
  const accountId = decoded?.id

  const { data = [], isLoading } = useGetTestTakersQuery(accountId)
  const list = data?.data ?? []

  const navigate = useNavigate()

  const [deleteTestTaker] = useDeleteTestTakerMutation()

  const handleDelete = async (id: string) => {
    try {
      await deleteTestTaker(id).unwrap()
      message.success('Đã xoá người test')
    } catch (error) {
      message.error('Xoá thất bại')
    }
  }

  console.log(list)

  const columns = [
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số định danh',
      dataIndex: 'personalId',
      key: 'personalId',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: boolean) => (
        <Tag
          color={
            gender === true ? 'blue' : gender === false ? 'pink' : 'default'
          }
        >
          {gender === true ? 'Nam' : gender === false ? 'Nữ' : 'Khác'}
        </Tag>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='link'
            onClick={() => navigate(`/test-takers/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title='Bạn có chắc chắn muốn xoá?'
            onConfirm={() => handleDelete(record._id)}
            okText='Xoá'
            cancelText='Huỷ'
          >
            <Button danger type='link'>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <HeaderCus />
      <Title level={3}>Danh sách Người Test ADN</Title>
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={list}
        loading={isLoading}
        bordered
      />
    </div>
  )
}
