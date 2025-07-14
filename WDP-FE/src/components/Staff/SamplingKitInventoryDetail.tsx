import { useParams, useNavigate } from 'react-router-dom'
import { useGetSamplingKitInventoryDetailQuery } from '../../features/samplingKitInventory/samplingKitInventoryAPI'
import { Card, Spin, Descriptions, Result, Button, Space, Tag } from 'antd'
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

export default function SamplingKitInventoryDetail() {
  const { samplingKitInventoryId } = useParams()
  const navigate = useNavigate()

  // 1. Lấy dữ liệu chi tiết của lô kit
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetSamplingKitInventoryDetailQuery(samplingKitInventoryId)

  const inventoryData = response?.data?.[0]

  // Xử lý các trạng thái loading và error
  if (isLoading) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '40px auto' }} />
    )
  }

  if (isError) {
    return (
      <Result
        status='error'
        title='Lỗi tải dữ liệu'
        subTitle={error?.data?.message}
      />
    )
  }

  if (!inventoryData) {
    return (
      <Result
        status='404'
        title='404'
        subTitle='Không tìm thấy thông tin lô kit.'
      />
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={`Chi tiết Lô Kit: ${inventoryData.lotNumber}`}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate(
                  '/staff/sampling-kit-inventory?pageNumber=1&pageSize=10'
                )
              }
            >
              Quay lại
            </Button>
            <Button type='primary' icon={<EditOutlined />}>
              Sửa
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label='ID Lô Kit'>
            {inventoryData._id}
          </Descriptions.Item>
          <Descriptions.Item label='Số Lô'>
            {inventoryData.lotNumber}
          </Descriptions.Item>
          <Descriptions.Item label='Tồn kho / Số lượng ban đầu'>
            {`${inventoryData.inventory} / ${inventoryData.kitAmount}`}
          </Descriptions.Item>
          <Descriptions.Item label='Mẫu'>
            {inventoryData.sample.name}
          </Descriptions.Item>
          <Descriptions.Item label='Cơ sở'>
            {inventoryData.facility.facilityName}
          </Descriptions.Item>
          <Descriptions.Item label='Ngày Nhập'>
            {dayjs(inventoryData.importDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label='Ngày Hết Hạn'>
            <Tag
              color={
                dayjs(inventoryData.expDate).isBefore(dayjs()) ? 'red' : 'green'
              }
            >
              {dayjs(inventoryData.expDate).format('DD/MM/YYYY')}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
