import { Form, Input, Button, notification } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useLoginMutation } from '../../features/auth/authApi'

export const LoginForm = () => {
  const [form] = Form.useForm()
  const [login, { isLoading }] = useLoginMutation()
  const [, setInputType] = useState<'email' | null>(null)
  const navigate = useNavigate()

  const validateInput = (value: string) => {
    if (!value) return Promise.reject('Vui lòng nhập email!')
    if (/^\d{10}$/.test(value)) return Promise.resolve()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return Promise.resolve()
    return Promise.reject('Email không hợp lệ!')
  }

  const handleSubmit = async (values: { email?: string; password: string }) => {
    try {
      const response = await login({
        email: values.email || '',
        password: values.password,
      }).unwrap()

      const token = response.data?.[0]?.accessToken

      if (token) {
        Cookies.set('userToken', token, { expires: 7 })
      } else {
        notification.error({
          message: 'Lỗi phản hồi',
          description: 'Không tìm thấy accessToken trong phản hồi từ server.',
        })
      }
    } catch (error: any) {
      notification.error({
        message: 'Đăng nhập thất bại',
        description: error?.data?.message || 'Đã xảy ra lỗi không xác định',
      })
    }
  }

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={handleSubmit}
      name='login-form'
      autoComplete='on'
      style={{
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Form.Item
        name='email'
        rules={[{ validator: (_, value) => validateInput(value) }]}
      >
        <Input placeholder='Nhập email' />
      </Form.Item>

      <Form.Item
        name='password'
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
      >
        <Input.Password placeholder='Nhập mật khẩu' />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button type='link' onClick={() => navigate('/register')}>
            Chưa có tài khoản? Đăng ký ngay
          </Button>
          <Button type='primary' htmlType='submit' loading={isLoading}>
            Đăng nhập
          </Button>
        </div>
      </Form.Item>
    </Form>
  )
}
