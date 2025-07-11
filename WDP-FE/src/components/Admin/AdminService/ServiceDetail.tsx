import { useParams } from 'react-router-dom'
import { useGetServiceDetailQuery } from '../../../features/service/serviceAPI'
import { Card, Spin, Table, Tag, Typography } from 'antd'

const { Text } = Typography
import './AdminService.css'
import type { Service } from '../../../types/service'

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { data, isLoading } = useGetServiceDetailQuery(serviceId)
  if (isLoading) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '20px auto' }} />
    )
  }

  const totalFee =
    (data.fee || 0) +
    (data.sample?.fee || 0) +
    (data.sample?.sampleType?.sampleTypeFee || 0) +
    (data.timeReturn?.timeReturnFee || 0)

  if (!data) {
    return <div>Không tìm thấy dịch vụ</div>
  }

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number') {
      return <Text type='secondary'>—</Text>
    }
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
  }

  const columns = [
    {
      title: 'Phí Dịch Vụ',
      dataIndex: 'fee',
      key: 'fee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Loại Mẫu',
      dataIndex: ['sample', 'name'],
      key: 'sampleName',
    },
    {
      title: 'Phí Lấy Mẫu',
      dataIndex: ['sample', 'fee'],
      key: 'sampleFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Kiểu Mẫu',
      dataIndex: ['sample', 'sampleType', 'name'],
      key: 'sampleTypeName',
    },
    {
      title: 'Phí Kiểu Mẫu',
      dataIndex: ['sample', 'sampleType', 'sampleTypeFee'],
      key: 'sampleTypeFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Thời Gian Trả (Ngày)',
      dataIndex: ['timeReturn', 'timeReturn'],
      key: 'timeReturn',
    },
    {
      title: 'Phí Trả Nhanh',
      dataIndex: ['timeReturn', 'timeReturnFee'],
      key: 'timeReturnFee',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Hành Chính',
      dataIndex: 'isAdministration',
      key: 'isAdministration',
      render: (isAdministration: boolean) =>
        isAdministration ? (
          <Tag color='green'>Có</Tag>
        ) : (
          <Tag color='red'>Không</Tag>
        ),
    },
    {
      title: 'Theo Họ Nội',
      dataIndex: 'isAgnate',
      key: 'isAgnate',
      render: (isAgnate: boolean) =>
        isAgnate ? <Tag color='green'>Có</Tag> : <Tag color='red'>Không</Tag>,
    },
    {
      title: 'Tổng Phí Dịch Vụ',
      key: 'totalFee',
      render: () => formatCurrency(totalFee),
    },
  ]

  console.log(data)
  return (
    <div>
      <Card
        title={`Thông tin chi tiết cho dịch vụ xét nghiệm ${data.sample.name} trả trong ${data.timeReturn.timeReturn} ngày theo ${data.isAgnate ? 'họ nội' : 'họ ngoại'}`}
        style={{ margin: '20px' }}
      >
        <Table
          bordered
          className='service-table'
          size='middle'
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={[data] as Service[]}
          rowKey='_id'
          pagination={false}
        />
      </Card>
    </div>
  )
}
