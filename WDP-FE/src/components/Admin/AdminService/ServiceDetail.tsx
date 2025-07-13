import { useParams } from 'react-router-dom'
import {
  useGetServiceDetailQuery,
  useUpdateServiceMutation,
} from '../../../features/service/serviceAPI'
import {
  Card,
  Result,
  Spin,
  Table,
  Tag,
  Typography,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  message,
} from 'antd'

const { Text } = Typography
const { Option } = Select
import './AdminService.css'
import type { Service } from '../../../types/service'
import { useGetTimeReturnsQuery } from '../../../features/admin/timeReturnAPI'
import { useGetSamplesQuery } from '../../../features/admin/sampleAPI'
import { useEffect, useMemo, useState } from 'react'

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation()
  const { data, isLoading, isError, error } =
    useGetServiceDetailQuery(serviceId)

  const {
    data: timeReturns,
    isLoading: isLoadingTimeReturns,
    isError: isErrorTimeReturns,
    error: errorTimeReturns,
  } = useGetTimeReturnsQuery({})

  const {
    data: samples,
    isLoading: isLoadingSamples,
    isError: isErrorSamples,
    error: errorSamples,
  } = useGetSamplesQuery({})

  useEffect(() => {
    if (isEditing && data) {
      form.setFieldsValue({
        name: data.name,
        fee: data.fee,
        timeReturn: data.timeReturn?._id,
        sample: data.sample?._id,
        isAgnate: data.isAgnate,
        isAdministration: data.isAdministration,
      })
    }
  }, [isEditing, data, form])

  const timeReturnOptions = useMemo(() => {
    const options =
      timeReturns?.data?.map((tr) => ({
        value: tr._id,
        label: `${tr.timeReturn} ngày - Phí: ${tr.timeReturnFee.toLocaleString('vi-VN')} VND`,
      })) || []

    if (
      data?.timeReturn &&
      !options.some((opt) => opt.value === data.timeReturn._id)
    ) {
      options.unshift({
        value: data.timeReturn._id,
        label: `${data.timeReturn.timeReturn} ngày - Phí: ${data.timeReturn.timeReturnFee.toLocaleString('vi-VN')} VND`,
      })
    }
    return options
  }, [timeReturns, data])

  // 3. Tính toán options cho Sample Select
  const sampleOptions = useMemo(() => {
    const options =
      samples?.data?.map((s) => ({
        value: s._id,
        label: s.name,
      })) || []

    if (data?.sample && !options.some((opt) => opt.value === data.sample._id)) {
      options.unshift({
        value: data.sample._id,
        label: data.sample.name,
      })
    }
    return options
  }, [samples, data])

  const handleFinish = async (values) => {
    try {
      await updateService({ id: serviceId, ...values }).unwrap()
      message.success('Cập nhật dịch vụ thành công!')
      setIsEditing(false)
    } catch (err) {
      message.error('Cập nhật thất bại.')
    }
  }

  if (isLoading || isLoadingTimeReturns || isLoadingSamples) {
    return (
      <Spin size='large' style={{ display: 'block', margin: '20px auto' }} />
    )
  }

  if (isError) {
    // `error` có thể có cấu trúc như { status: 409, data: { message: '...' } }
    const errorMessage = error?.data?.message || 'Có lỗi xảy ra'
    const errorStatus = error?.status || 'Lỗi'

    return (
      <Result
        status={errorStatus === 404 ? '404' : 'error'}
        title={errorStatus}
        subTitle={errorMessage}
        style={{ marginTop: '20px' }}
      />
    )
  }

  if (isErrorTimeReturns || isErrorSamples) {
    const errorMessage =
      errorTimeReturns?.message || errorSamples?.message || 'Lỗi tải dữ liệu.'
    const errorStatus = isErrorTimeReturns
      ? errorTimeReturns?.status
      : errorSamples?.status

    const errorTitle = isErrorTimeReturns ? 'Lỗi thời gian trả' : 'Lỗi mẫu thử'

    return (
      <Result status={errorStatus} title={errorTitle} subTitle={errorMessage} />
    )
  }

  const totalFee =
    (data.fee || 0) +
    (data.sample?.fee || 0) +
    (data.sample?.sampleType?.sampleTypeFee || 0) +
    (data.timeReturn?.timeReturnFee || 0)

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

  const DisplayView = (
    <div>
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
    </div>
  )

  const EditView = (
    <Form form={form} layout='vertical' onFinish={handleFinish}>
      <Form.Item name='fee' label='Phí Dịch Vụ' rules={[{ required: true }]}>
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) =>
            value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0
          }
        />
      </Form.Item>
      <Form.Item
        name='timeReturn'
        label='Thời Gian Trả'
        rules={[{ required: true }]}
      >
        <Select
          placeholder='Chọn thời gian trả'
          loading={isLoadingTimeReturns}
          options={timeReturnOptions} // Sử dụng options đã tính toán
        />
      </Form.Item>
      <Form.Item name='sample' label='Mẫu Thử' rules={[{ required: true }]}>
        <Select
          placeholder='Chọn mẫu thử'
          loading={isLoadingSamples}
          options={sampleOptions} // Sử dụng options đã tính toán
        />
      </Form.Item>
      <Space>
        <Form.Item
          label='Hành Chính'
          name='isAdministration'
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
        <Form.Item label='Theo Họ Nội' name='isAgnate' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Space>
      <Form.Item>
        <Space>
          <Button type='primary' htmlType='submit' loading={isUpdating}>
            Lưu
          </Button>
          <Button onClick={() => setIsEditing(false)}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  )

  return (
    <Card
      title={isEditing ? 'Chỉnh sửa Dịch Vụ' : `Chi tiết dịch vụ`}
      style={{ margin: '20px' }}
      extra={
        !isEditing && (
          <Button type='primary' onClick={() => setIsEditing(true)}>
            Sửa
          </Button>
        )
      }
    >
      {isEditing ? EditView : DisplayView}
    </Card>
  )
}
