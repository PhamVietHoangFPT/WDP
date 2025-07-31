import {
  Card,
  Typography,
  Tag,
  Button,
  Popconfirm,
  message,
  Row,
  Col,
  Pagination,
  Empty,
} from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useDeleteTestTakerMutation,
  useGetTestTakersQuery,
} from '../../features/customer/testTakerApi'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'

const { Title, Text } = Typography

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

  const navigate = useNavigate()
  const [deleteTestTaker] = useDeleteTestTakerMutation()
  const list = data?.data ?? []

  const handleDelete = async (id: string) => {
    try {
      await deleteTestTaker(id).unwrap()
      message.success('Đã xoá người test')
    } catch (error) {
      message.error('Xoá thất bại')
    }
  }

  const renderGender = (gender: boolean) => (
    <Tag
      color={gender === true ? 'blue' : gender === false ? 'pink' : 'default'}
    >
      {gender === true ? 'Nam' : gender === false ? 'Nữ' : 'Khác'}
    </Tag>
  )

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Danh sách Người Test ADN
      </Title>

      {list.length === 0 && !isLoading && (
        <Empty description='Chưa có người test nào.' />
      )}

      <Row gutter={[16, 16]}>
        {list.map((person: any) => (
          <Col span={24} md={12} xl={8} key={person._id}>
            <Card
              bordered
              style={{
                minHeight: 240,
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 0,
              }}
              bodyStyle={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 20,
              }}
            >
              {/* Tên người test */}
              <div>
                <Text strong style={{ fontSize: 20 }}>
                  {person.name}
                </Text>
              </div>

              {/* Thông tin cá nhân */}
              <div style={{ marginTop: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Số định danh:</Text>
                  <Text>{person.personalId}</Text>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Giới tính:</Text>
                  <Text>{renderGender(person.gender)}</Text>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 0,
                  }}
                >
                  <Text strong>Ngày sinh:</Text>
                  <Text>{dayjs(person.dateOfBirth).format('DD-MM-YYYY')}</Text>
                </div>

                {/* Nút hành động */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 16,
                  }}
                >
                  <Button
                    type='primary'
                    ghost
                    onClick={() => navigate(`/test-takers/edit/${person._id}`)}
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title='Bạn có chắc chắn muốn xoá?'
                    onConfirm={() => handleDelete(person._id)}
                    okText='Xoá'
                    cancelText='Huỷ'
                  >
                    <Button danger> Xoá </Button>
                  </Popconfirm>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {!isLoading && (
        <Pagination
          style={{
            marginTop: 30,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          total={data?.pagination?.totalItems || 0}
          pageSize={Number(pageSize)}
          current={Number(pageNumber)}
          onChange={(page, size) => {
            navigate(`/list-testee?pageNumber=${page}&pageSize=${size}`)
          }}
          showSizeChanger
          pageSizeOptions={['10', '20', '50']}
          showTotal={(total) => `Tổng số: ${total}`}
        />
      )}
    </div>
  )
}
