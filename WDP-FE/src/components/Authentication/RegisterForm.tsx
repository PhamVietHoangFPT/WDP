import { useRegisterMutation } from '../../features/auth/authApi'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'
import { Input, Button, Form as AntdForm, notification } from 'antd'
import { useNavigate } from 'react-router-dom'

export function RegisterForm() {
  const [register, { isLoading }] = useRegisterMutation()
  const navigate = useNavigate()

  interface FieldType {
    name: string
    email: string
    password: string
    retypePassword: string
  }

  const initialValues: FieldType = {
    name: '',
    email: '',
    password: '',
    retypePassword: '',
  }

  const validationSchema = Yup.object({
    name: Yup.string().required('Vui lòng nhập tên người dùng!'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Vui lòng nhập email!'),
    password: Yup.string()
      .min(6, 'Mật khẩu ít nhất 6 ký tự')
      .required('Vui lòng nhập mật khẩu!'),
    retypePassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
      .required('Vui lòng nhập lại mật khẩu!'),
  })

  const onFinish = async (
    values: FieldType,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap()

      notification.success({
        message: 'Đăng ký thành công',
        description: 'Vui lòng kiểm tra hộp thư để xác thực tài khoản.',
      })

      resetForm()
      navigate('/login')
    } catch (error: any) {
      const desc =
        error?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.'
      notification.error({ message: 'Đăng ký thất bại', description: desc })
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onFinish}
    >
      {({ handleSubmit, errors, touched }) => (
        <AntdForm
          layout='vertical'
          onFinish={handleSubmit}
          style={{
            width: 'auto',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          <AntdForm.Item
            name='name'
            label='Tên người dùng'
            validateStatus={touched.name && errors.name ? 'error' : ''}
            help={touched.name && errors.name}
            required
          >
            <Field as={Input} name='name' placeholder='Nhập tên người dùng' />
          </AntdForm.Item>

          <AntdForm.Item
            name='email'
            label='Email'
            validateStatus={touched.email && errors.email ? 'error' : ''}
            help={touched.email && errors.email}
            required
          >
            <Field as={Input} name='email' placeholder='Nhập email' />
          </AntdForm.Item>

          <AntdForm.Item
            name='password'
            label='Mật khẩu'
            validateStatus={touched.password && errors.password ? 'error' : ''}
            help={touched.password && errors.password}
            required
          >
            <Field
              as={Input.Password}
              name='password'
              placeholder='Nhập mật khẩu'
            />
          </AntdForm.Item>

          <AntdForm.Item
            name='retypePassword'
            label='Nhập lại mật khẩu'
            validateStatus={
              touched.retypePassword && errors.retypePassword ? 'error' : ''
            }
            help={touched.retypePassword && errors.retypePassword}
            required
          >
            <Field
              as={Input.Password}
              name='retypePassword'
              placeholder='Nhập lại mật khẩu'
            />
          </AntdForm.Item>

          <AntdForm.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Button type='link' onClick={() => navigate('/login')}>
                Đã có tài khoản? Đăng nhập ngay
              </Button>
              <Button type='primary' htmlType='submit' loading={isLoading}>
                Đăng ký
              </Button>
            </div>
          </AntdForm.Item>
        </AntdForm>
      )}
    </Formik>
  )
}
