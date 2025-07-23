'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, Typography, Button, message } from 'antd'
import { useCreateConditionPaymentHistoryMutation } from '../../features/customer/paymentApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
const { Title, Text } = Typography

export default function PaymentConditionSuccessPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [status, setStatus] = useState<'success' | 'error' | 'processing'>(
        'processing'
    )
    const [createConditionPaymentHistory] =
        useCreateConditionPaymentHistoryMutation()

    const effectRan = useRef(false)

    useEffect(() => {
        // Chỉ chạy logic khi effectRan.current là false
        if (effectRan.current === false) {
            const rawData = Object.fromEntries(searchParams.entries())
            // ... (toàn bộ logic xử lý và gọi API của bạn đặt ở đây)

            const responseCode = rawData.vnp_ResponseCode
            if (!responseCode) {
                // ...
                return
            }

            createConditionPaymentHistory(rawData)
                .unwrap()
                .then(() => {
                    setStatus(responseCode === '00' ? 'success' : 'error')
                })
                .catch((err) => {
                    console.error('❌ Không thể lưu trạng thái thanh toán:', err)
                    message.error('Không thể cập nhật trạng thái thanh toán')
                    setStatus('error')
                })

            // Đánh dấu là đã chạy
            return () => {
                effectRan.current = true
            }
        }
    }, [searchParams, createConditionPaymentHistory])

    const renderContent = () => {
        if (status === 'processing') {
            return <Text>Đang xử lý thanh toán...</Text>
        }

        if (status === 'success') {
            return (
                <>
                    <Title level={3}>🎉 Thanh toán thành công!</Title>
                    <Text>Chúng tôi đã nhận được thanh toán của bạn. Xin cảm ơn!</Text>
                </>
            )
        }

        return (
            <>
                <Title level={3} type='danger'>
                    ❌ Thanh toán thất bại!
                </Title>
                <Text type='secondary'>
                    Giao dịch không thành công hoặc bị từ chối.
                </Text>
            </>
        )
    }

    return (
        <Card style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
            {renderContent()}
            <Button
                type='primary'
                onClick={() => navigate('/')}
                style={{ marginTop: 24 }}
            >
                Về trang chủ
            </Button>
        </Card>
    )
}
