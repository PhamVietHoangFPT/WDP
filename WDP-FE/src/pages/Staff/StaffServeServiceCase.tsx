import { useMemo, useState } from 'react'
import {
  Table,
  Typography,
  Tooltip,
  Card,
  Form,
  List,
  Divider,
  Pagination,
  Spin,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import Cookies from 'js-cookie'
import { useGetServeServiceCaseQuery } from '../../features/staff/staffAPI'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Title } = Typography

interface TestTaker {
  _id: string
  name: string
  personalId: string
  dateOfBirth: string
  created_at: string
}

export default function StaffServeServiceCase() {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  })

  const userData = Cookies.get('userData')
  const parsedUserData = userData
    ? JSON.parse(decodeURIComponent(userData))
    : {}
  const accountId = parsedUserData.id

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  // ✅ Gọi API đã phục vụ
  const { data, isLoading, isFetching } = useGetServeServiceCaseQuery({
    accountId,
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  })

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination)
  }

  const groupedData = useMemo(() => {
    if (!data?.data) return []

    const groups = data.data.reduce(
      (acc, item) => {
        const date = dayjs(item.created_at).format('YYYY-MM-DD')
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(item)
        return acc
      },
      {} as Record<string, TestTaker[]>
    )

    return Object.entries(groups)
      .map(([date, items]) => ({ date, items }))
      .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
  }, [data])

  const columns: ColumnsType<TestTaker> = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CCCD/Mã định danh',
      dataIndex: 'personalId',
      key: 'personalId',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('HH:mm DD/MM/YYYY')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
    },
  ]

  const innerTableColumns = columns.filter((col) => col.key !== 'created_at')

  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day')
  }

  if (isLoading || isFetching) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Spin size='large' />
      </div>
    )
  }

  return (
    <Card>
      <Title level={4}>Hồ sơ đã phục vụ</Title>
      <List
        dataSource={groupedData}
        renderItem={(group) => (
          <div key={group.date} style={{ marginBottom: 24 }}>
            <Divider orientation='left' style={{ fontWeight: 'bold' }}>
              Ngày tạo: {dayjs(group.date).format('dddd, DD/MM/YYYY')}
            </Divider>
            <Table
              columns={innerTableColumns}
              dataSource={group.items}
              rowKey='_id'
              pagination={false}
              bordered
            />
          </div>
        )}
      />
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={data?.pagination?.totalItems}
          onChange={(page, pageSize) =>
            handleTableChange({ current: page, pageSize })
          }
          showSizeChanger
        />
      </div>
    </Card>
  )
}
