// src/pages/TestTakerList.tsx
import {
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Typography,
  Tag,
  Pagination,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const pageNumber = searchParams.get('pageNumber') || '1'
  const pageSize = searchParams.get('pageSize') || '10'

  const { data = [], isLoading } = useGetTestTakersQuery({
    accountId,
    pageSize: Number(pageSize),
    pageNumber: Number(pageNumber),
  })
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
            onClick={() => {
              navigate(`/test-takers/edit/${record._id}`)
            }}
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
        pagination={false}
      />
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Typography.Text>Đang tải dữ liệu...</Typography.Text>
        </div>
      ) : (
        <Pagination
          style={{ marginTop: 20, textAlign: 'center' }}
          total={data?.pagination?.totalItems || 0}
          pageSize={Number(pageSize)}
          current={Number(pageNumber)}
          onChange={(page, size) => {
            navigate(`/list-testee?pageNumber=${page}&pageSize=${size}`)
          }}
        />
      )}
    </div>
  )
}
