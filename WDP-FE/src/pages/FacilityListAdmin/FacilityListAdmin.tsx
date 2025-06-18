import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Input,
  Typography,
  Spin,
  Pagination,
  Popconfirm,
  message,
  Space,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EyeOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  useGetFacilitiesListQuery,
  //   useDeleteFacilityMutation,
} from '../../features/admin/facilitiesAPI'
import type { Facility } from '../../types/facilities'

const { Title } = Typography

interface FacilityResponse {
  data: Facility[]
  isLoading: boolean
  isFetching: boolean
  pagination: {
    totalItems: number
    pageSize: number
    totalPages: number
    currentPage: number
  }
}

const FacilityListAdmin: React.FC = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState<string>('')
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading, isFetching } =
    useGetFacilitiesListQuery<FacilityResponse>({
      pageNumber,
      pageSize,
      name: debouncedSearch,
    })

  //   const [deleteFacility, { isLoading: isDeleting }] = useDeleteFacilityMutation()

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchText])

  //   const handleDelete = async (id: string) => {
  //     try {
  //       await deleteFacility(id).unwrap()
  //       message.success('Xóa cơ sở thành công')
  //       refetch()
  //     } catch (error) {
  //       message.error('Xóa thất bại')
  //     }
  //   }

  const columns: ColumnsType<any> = [
    {
      title: 'Tên cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
      sorter: (a, b) => a.facilityName.localeCompare(b.facilityName),
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['address', 'fullAddress'],
      key: 'address',
    },
    // {
    //   title: 'Số điện thoại',
    //   dataIndex: 'phoneNumber',
    //   key: 'phoneNumber',
    //   render: (phone: string | null) => phone || 'Không có',
    // },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            icon={<EyeFilled style={{ fontSize: 18 }} />}
            type='default'
            style={{
              backgroundColor: '#e6f4ff',
              borderColor: '#91caff',
              color: '#1677ff',
            }}
            onClick={() => navigate(`/admin/facility/${record._id}`)}
          />
          <Button
            icon={<EditOutlined />}
            style={{
              backgroundColor: '#faad14',
              borderColor: '#faad14',
              color: '#fff',
            }}
            onClick={() => navigate(`/admin/facility/${record._id}`)}
          />
          <Popconfirm
            title='Xác nhận xóa cơ sở này?'
            okText='Xóa'
            cancelText='Hủy'
            // onConfirm={() => handleDelete(record._id)}
          >
            <Button
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
              }}
              //   loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý cơ sở</Title>

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Input
          placeholder='Tìm kiếm theo tên cơ sở'
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/createFacility')}
        >
          Thêm cơ sở
        </Button>
      </div>

      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Table
            dataSource={data?.data}
            columns={columns}
            rowKey='_id'
            pagination={false}
            loading={isFetching}
          />

          <Pagination
            current={pageNumber}
            pageSize={pageSize}
            total={data?.pagination.totalItems || 0}
            style={{ textAlign: 'center', paddingTop: 20 }}
            onChange={(page, size) => {
              setPageNumber(page)
              setPageSize(size)
            }}
          />
        </>
      )}
    </div>
  )
}

export default FacilityListAdmin
