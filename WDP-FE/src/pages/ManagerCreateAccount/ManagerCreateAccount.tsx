import type React from 'react'
import { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  Radio,
  message,
  Card,
  Spin,
  Space,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
// import { useNavigate } from "react-router-dom"
import {
  useGetRoleListQuery,
  useCreateAccountMutation,
} from '../../features/manager/createAccountAPI'

const { Title } = Typography
const { Option } = Select

interface CreateAccountForm {
  name: string
  email: string
  role: string
  gender: boolean
  phoneNumber: string
}

interface Role {
  _id: string
  role: string
}

const ManagerCreateAccount: React.FC = () => {
  //   const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoleListQuery({
    pageNumber: 1,
    pageSize: 100,
  })

  const [createAccount] = useCreateAccountMutation()

  const handleSubmit = async (values: CreateAccountForm) => {
    setIsSubmitting(true)
    try {
      const response = await createAccount(values).unwrap()
      message.success('Tạo tài khoản thành công!')
      form.resetFields()

      console.log('Account created:', response)
    } catch (error: any) {
      console.error('Create account error:', error)
      message.error(error?.data?.message || 'Tạo tài khoản thất bại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  //   const handleReset = () => {
  //     form.resetFields()
  //   }

  const validatePhoneNumber = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập số điện thoại!'))
    }

    // Vietnamese phone number validation (basic)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('Số điện thoại không hợp lệ!'))
    }

    return Promise.resolve()
  }

  const validateEmail = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập email!'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('Email không hợp lệ!'))
    }

    return Promise.resolve()
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Tạo tài khoản mới</Title>

      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            gender: true, // Default to male
          }}
        >
          <Form.Item
            label='Họ và tên'
            name='name'
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
              { max: 50, message: 'Họ và tên không được quá 50 ký tự!' },
            ]}
          >
            <Input placeholder='Nhập họ và tên' size='large' />
          </Form.Item>

          <Form.Item
            label='Email'
            name='email'
            rules={[{ validator: validateEmail }]}
          >
            <Input placeholder='Nhập địa chỉ email' size='large' type='email' />
          </Form.Item>

          <Form.Item
            label='Số điện thoại'
            name='phoneNumber'
            rules={[{ validator: validatePhoneNumber }]}
          >
            <Input
              placeholder='Nhập số điện thoại (VD: 0909090909)'
              size='large'
            />
          </Form.Item>

          <Form.Item
            label='Vai trò'
            name='role'
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              placeholder='Chọn vai trò'
              size='large'
              loading={isLoadingRoles}
              disabled={isLoadingRoles}
            >
              {rolesData?.data?.map((role: Role) => (
                <Option key={role._id} value={role._id}>
                  {role.role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label='Giới tính'
            name='gender'
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Radio.Group size='large'>
              <Radio value={true}>Nam</Radio>
              <Radio value={false}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Space size='middle'>
              <Button
                type='primary'
                htmlType='submit'
                icon={<SaveOutlined />}
                loading={isSubmitting}
                size='large'
              >
                Tạo tài khoản
              </Button>

              {/* <Button type="default" onClick={handleReset} disabled={isSubmitting} size="large">
                Đặt lại
              </Button>

              <Button type="default" onClick={() => navigate(-1)} disabled={isSubmitting} size="large">
                Quay lại
              </Button> */}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Loading overlay for roles */}
      {isLoadingRoles && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Spin size='large' />
        </div>
      )}
    </div>
  )
}

export default ManagerCreateAccount
