import React, { useState } from 'react';
import { Card, Row, Col, Spin, Form, Select, Button, Space, message } from 'antd';
import { useGetTestTakersQuery } from '../../features/customer/testTakerApi';
import { useGetBookingStatusQuery } from '../../features/customer/bookingApi';
import type { TestTaker } from '../../types/testTaker';
import type { Booking } from '../../types/booking/booking';
import type { Service } from '../../types/service';
import { useGetServiceDetailQuery } from '../../features/service/serviceAPI';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useCreateCaseMemberMutation } from '../../features/caseMembers/caseMemebers';
import { useCreateServiceCaseMutation } from '../../features/serviceCase/serviceCase';
import { useCreateBookingPaymentMutation } from '../../features/vnpay/vnpayApi';

interface TestTakerListResponse {
    data: {
        data: TestTaker[];
    };
    isLoading: boolean;
}
interface BookingListResponse {
    data: Booking[];
    isBookingLoading: boolean;
}
interface ServiceDetailResponse {
    data: Service;
}
const ServiceAtHomeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Extract the 'id' parameter from the URL
    const [form] = Form.useForm();
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
    const [testTakerCount, setTestTakerCount] = useState(2); // Start with 2 test takers
    const { data, isLoading } = useGetTestTakersQuery<TestTakerListResponse>({
        pageNumber: 1,
        pageSize: 5,
    });
    const { data: bookingData, isBookingLoading } = useGetBookingStatusQuery<BookingListResponse>(false);
    const { data: serviceDetail } = useGetServiceDetailQuery<ServiceDetailResponse>(id)
    const [createCaseMember, { isLoading: isCreating }] = useCreateCaseMemberMutation()
    const [createServiceCase] = useCreateServiceCaseMutation()
    const [createPaymentUrl] = useCreateBookingPaymentMutation()
    const dataTestTaker = data?.data || [];
    const dataBookingList = bookingData || [];
    // Watch form values to track selected test takers
    const selectedTestTakers = Form.useWatch([], form);
    if (isLoading || isBookingLoading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }} />;
    }

    // const onFinish = (values: { [key: string]: string }) => {
    //     console.log('Form Values:', values);
    //     // Handle form submission (e.g., API call or further processing)
    // };

    const handleSelectBooking = (bookingId: string) => {
        form.setFieldsValue({ booking: bookingId });
        setSelectedBooking(bookingId);
    };

    const addTestTaker = () => {
        if (testTakerCount < 3) {
            setTestTakerCount(testTakerCount + 1);
        }
    };

    const removeTestTaker = () => {
        if (testTakerCount === 3) {
            setTestTakerCount(2);
            form.setFieldsValue({ testTaker3: undefined }); // Clear the third test taker field
        }
    };

    // Function to filter out already selected test takers for a specific field
    const getAvailableTestTakers = (currentField: string) => {
        const selectedIds = Object.keys(selectedTestTakers || {})
            .filter((key) => key.startsWith('testTaker') && key !== currentField)
            .map((key) => selectedTestTakers[key])
            .filter((id) => id); // Remove undefined values
        return dataTestTaker.filter((taker) => !selectedIds.includes(taker._id));
    };
    const onFinish = async (values: any) => {
        // Collect test taker IDs into an array
        const testTakers = [
            values.testTaker1,
            values.testTaker2,
            values.testTaker3,
        ].filter((id) => id); // Remove undefined values
        const data = {
            testTaker: testTakers,
            booking: values.booking,
            service: id,
            note: '',
            isAtHome: true,
        }

        console.log('Dữ liệu gửi đi:', { data })

        try {
            const caseMember = await createCaseMember({ data }).unwrap()
            const caseMemberId = caseMember?.data?._id || caseMember?._id
            const serviceCase = await createServiceCase({ caseMemberId })
            const serviceCaseId = serviceCase?.data?._id
            if (!caseMemberId) throw new Error('Đăng ký thất bại')
            const redirectUrl = await createPaymentUrl({
                serviceCaseId,
            }).unwrap()
            window.open(redirectUrl, '_blank')
        } catch (err: any) {
            console.error('Chi tiết lỗi từ API:', err.data)
            message.error(
                err.data?.title || err.data?.message || 'Đăng ký thất bại'
            )
        }
    }
    return (
        <div
            style={{
                background: '#EEEEEE',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '80%',
                }}
            ><div
                style={{ display: "flex", justifyContent: 'space-around' }}>
                    <p style={{ color: 'black' }}>
                        Xét nghiệm huyết thống bên{' '}
                        {serviceDetail?.isAgnate ? 'nội' : 'ngoại'}
                    </p>
                    <p style={{ fontStyle: 'italic' }}>
                        Loại mẫu: {serviceDetail?.sample?.name}
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}
                >
                    <Row gutter={16}>
                        {[...Array(testTakerCount)].map((_, index) => {
                            const fieldName = `testTaker${index + 1}`;
                            return (
                                <Col span={24} key={fieldName}>
                                    <Form.Item
                                        name={fieldName}
                                        label={`Test Taker ${index + 1}`}
                                        rules={[{ required: true, message: `Please select Test Taker ${index + 1}` }]}

                                    >
                                        <Select
                                            placeholder={`Select Test Taker ${index + 1}`}
                                            options={getAvailableTestTakers(fieldName).map((taker) => ({
                                                value: taker._id,
                                                label: taker.name || `Test Taker ${taker._id}`,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            );
                        })}
                        <Col span={24}>
                            <Space style={{ width: '100%', marginBottom: 16 }}>
                                {testTakerCount < 3 && (
                                    <Button
                                        type="dashed"
                                        onClick={addTestTaker}
                                        block
                                    >
                                        Add Another Test Taker
                                    </Button>
                                )}
                                {testTakerCount === 3 && (
                                    <Button
                                        type="dashed"
                                        danger
                                        onClick={removeTestTaker}
                                        block
                                    >
                                        Remove Test Taker 3
                                    </Button>
                                )}
                            </Space>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="booking"
                                label="Booking"
                                rules={[{ required: true, message: 'Please select a Booking' }]}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Row gutter={[16, 16]}>
                                        {dataBookingList.map((booking) => (
                                            <Col span={12} key={booking?._id}>
                                                <Card
                                                    title={`Ngày: ${moment(booking.bookingDate).format('DD-MM-YYYY')}`}
                                                    style={{
                                                        border: selectedBooking === booking?._id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                        backgroundColor: selectedBooking === booking?._id ? '#e6f7ff' : 'white',
                                                    }}
                                                >
                                                    <p>Giờ bắt đầu: {booking.slot.startTime} A.M</p>
                                                    <p>Giờ kết thúc: {booking.slot.endTime} A.M</p>
                                                    {/* Add more booking details as needed */}
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleSelectBooking(booking._id)}
                                                        block
                                                        disabled={selectedBooking === booking._id}
                                                    >
                                                        {selectedBooking === booking?._id ? 'Selected' : 'Select'}
                                                    </Button>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <p style={{ fontStyle: "italic", color: "gray" }}>* Các dịch vụ tại nhà chỉ có thể được sử dụng với mục đích dân sự</p>
                        </Col>
                        <Col span={24}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={isCreating}>
                                    Đăng ký
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default ServiceAtHomeForm;