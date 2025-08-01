// pages/ServiceCaseAlreadyHasAdn.tsx
import React, { useEffect, useState } from 'react'
import { Table, Select, Typography, Spin, Tag, Alert } from 'antd'
import {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
} from '../../features/doctor/doctorAPI'

const { Title } = Typography

export default function ServiceCaseAlreadyHasAdn() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [resultExists] = useState(true)

  const { data: statusData, isLoading: loadingStatus } =
    useGetAllRequestStatusListQuery({ pageNumber: 1, pageSize: 100 })
  const {
    data: serviceCaseData,
    isLoading,
    error,
  } = useGetServiceCasesWithoutAdnQuery(
    { currentStatus: selectedStatus, resultExists },
    { skip: !selectedStatus }
  )

  useEffect(() => {
    if (statusData?.data?.length && !selectedStatus) {
      setSelectedStatus(statusData.data[0]._id)
    }
  }, [statusData])

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace' }}>{id}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: ['currentStatus', 'testRequestStatus'],
      render: (text: string) => <Tag color='green'>{text}</Tag>,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📑 Hồ sơ đã có tài liệu ADN</Title>

      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 250 }}
          loading={loadingStatus}
        >
          {statusData?.data?.map((s) => (
            <Select.Option key={s._id} value={s._id}>
              {s.testRequestStatus}
            </Select.Option>
          ))}
        </Select>
      </div>

      {error && (
        <Alert
          type='error'
          message='Lỗi khi tải hồ sơ'
          description={(error as any)?.data?.message || 'Không rõ lỗi'}
        />
      )}

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={serviceCaseData?.data || []}
          rowKey='_id'
        />
      )}
    </div>
  )
}
