import React from 'react'
import { Row, Col, Form, Select, Button, Card, Typography, Tag, Space, Statistic } from 'antd'
import type { TestTaker } from '../../types/testTaker'
import type { Service } from '../../types/service'
import BookingComponent from '../../pages/BookingPage/BookingPage'

interface MultipleServicesFormProps {
    form: any
    onFinish: (values: any) => void
    testTakerCount: number
    serviceList: Service[]
    isLoadingServices: boolean
    serviceError: any
    selectedTestTakers: any
    isCreating: boolean
    isDisabled: boolean
    isAgreed: boolean
    getAvailableTestTakers: (currentField: string) => TestTaker[]
    handleConfirmBooking: any
    setSelectedSlotId: any
    selectedSlotId: string | null
    selectedAddressId: string | null
    setSelectedAddressId: any
    setIsDisabled: any
    setIsAgreed: any
}

const MultipleServicesForm: React.FC<MultipleServicesFormProps> = ({
    form,
    onFinish,
    testTakerCount,
    serviceList,
    isLoadingServices,
    serviceError,
    selectedTestTakers,
    isCreating,
    isDisabled,
    isAgreed,
    getAvailableTestTakers,
    handleConfirmBooking,
    setSelectedSlotId,
    selectedSlotId,
    selectedAddressId,
    setSelectedAddressId,
    setIsDisabled,
    setIsAgreed
}) => {
    return (
        <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}
        >
            <Row gutter={16}>
                {/* Chọn người xét nghiệm */}
                {[...Array(testTakerCount)].map((_, index) => {
                    const testTakerFieldName = `testTaker${index + 1}`
                    return (
                        <Col span={24} key={testTakerFieldName} style={{ marginBottom: '24px' }}>
                            <div style={{
                                padding: '16px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                backgroundColor: '#fafafa'
                            }}>
                                <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>
                                    Người xét nghiệm {index + 1}
                                </h4>

                                {/* Select Test Taker */}
                                <Form.Item
                                    name={testTakerFieldName}
                                    label={`Chọn người xét nghiệm ${index + 1}`}
                                    rules={[
                                        {
                                            required: true,
                                            message: `Vui lòng chọn người ${index + 1}`,
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder={`Chọn người xét nghiệm ${index + 1}`}
                                        options={getAvailableTestTakers(testTakerFieldName).map(
                                            (taker) => ({
                                                value: taker._id,
                                                label: taker.name || `Test Taker ${taker._id}`,
                                            })
                                        )}
                                    />
                                </Form.Item>
                            </div>
                        </Col>
                    )
                })}

                {/* Chọn dịch vụ chung */}
                <Col span={24} style={{ marginBottom: '24px' }}>
                    <div style={{
                        padding: '16px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        backgroundColor: '#fff3cd'
                    }}>
                        <h4 style={{ marginBottom: '16px', color: '#856404' }}>
                            Dịch vụ chung cho tất cả người xét nghiệm
                        </h4>

                        <Form.Item
                            name="sharedServices"
                            label="Chọn các dịch vụ (có thể chọn nhiều)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ít nhất một dịch vụ',
                                },
                            ]}
                        >
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {isLoadingServices ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#999',
                                        fontSize: '16px'
                                    }}>
                                        Đang tải dịch vụ...
                                    </div>
                                ) : serviceError ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: 'gray',
                                        fontSize: '16px'
                                    }}>
                                        {(serviceError as any)?.data?.message}
                                    </div>
                                ) : (
                                    <Row gutter={[12, 12]}>
                                        {serviceList.map((service: Service) => {
                                            const isSelected = selectedTestTakers?.sharedServices?.includes(service._id);
                                            return (
                                                <Col xs={24} sm={12} md={8} key={service._id}>
                                                    <Card
                                                        size="small"
                                                        hoverable
                                                        style={{
                                                            cursor: 'pointer',
                                                            border: isSelected
                                                                ? '2px solid #1890ff'
                                                                : '1px solid #d9d9d9'
                                                        }}
                                                        onClick={() => {
                                                            const currentServices = selectedTestTakers?.sharedServices || [];
                                                            let newServices;
                                                            if (currentServices.includes(service._id)) {
                                                                // Bỏ chọn service
                                                                newServices = currentServices.filter((id: string) => id !== service._id);
                                                            } else {
                                                                // Thêm service
                                                                newServices = [...currentServices, service._id];
                                                            }
                                                            form.setFieldValue('sharedServices', newServices);
                                                        }}
                                                    >
                                                        <Card.Meta
                                                            title={
                                                                <div>
                                                                    <Typography.Title
                                                                        level={5}
                                                                        style={{ marginTop: 0, marginBottom: 4 }}
                                                                        ellipsis={{ tooltip: service.name }}
                                                                    >
                                                                        {service.name}
                                                                    </Typography.Title>
                                                                    <Typography.Text
                                                                        type='secondary'
                                                                        style={{ fontSize: '12px' }}
                                                                    >
                                                                        Mẫu: {service.sample?.name || 'N/A'}
                                                                    </Typography.Text>
                                                                </div>
                                                            }
                                                            description={
                                                                <Space direction='vertical' size='small' style={{ width: '100%' }}>
                                                                    <Tag color={service.isAgnate ? 'blue' : 'purple'}>
                                                                        {service.isAgnate ? 'Bên nội' : 'Bên ngoại'}
                                                                    </Tag>
                                                                    <Statistic
                                                                        value={
                                                                            (service.fee || 0) +
                                                                            (service.timeReturn?.timeReturnFee || 0) +
                                                                            (service.sample?.fee || 0)
                                                                        }
                                                                        precision={0}
                                                                        valueStyle={{
                                                                            color: '#1565C0',
                                                                            fontSize: '14px',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                        suffix='₫'
                                                                    />
                                                                </Space>
                                                            }
                                                        />
                                                    </Card>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                )}
                            </div>
                        </Form.Item>
                    </div>
                </Col>

                <Form.Item
                    name='slot'
                    rules={[{ required: true, message: 'Vui lòng chọn lịch hẹn' }]}
                    style={{ placeSelf: 'center' }}
                >
                    <BookingComponent
                        onConfirmBooking={handleConfirmBooking}
                        onSelectSlot={setSelectedSlotId}
                        selectedSlotId={selectedSlotId}
                        addressId={selectedAddressId}
                        setAddressId={setSelectedAddressId}
                        setDisabled={setIsDisabled}
                        setAgreed={setIsAgreed}
                        isAgreed={isAgreed}
                        selectedServices={
                            (selectedTestTakers?.sharedServices || []).map((serviceId: string) =>
                                serviceList.find((s: Service) => s._id === serviceId)
                            ).filter(Boolean)
                        }
                    />
                </Form.Item>
                <Col span={24}>
                    <p style={{ fontStyle: 'italic', color: 'gray' }}>
                        * Các dịch vụ tại nhà chỉ có thể được sử dụng với mục đích dân sự
                    </p>
                </Col>
                <Col span={24}>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            block
                            disabled={isDisabled || !isAgreed}
                            loading={isCreating}
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    )
}

export default MultipleServicesForm
