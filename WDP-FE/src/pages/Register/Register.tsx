"use client"

import { Layout, Card, Typography, Row, Col, Button, Form, Input, Select, notification } from "antd"
import Logo from "../../assets/Logo.png"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { useEffect } from "react"
import { useRegisterAccountMutation } from "../../features/customer/registerAPI"

const { Content } = Layout
const { Title } = Typography
const { Option } = Select

interface RegisterFormData {
  name: string
  email: string
  password: string
  phoneNumber: string
  gender: boolean
}

export default function Register() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [registerAccount, { isLoading }] = useRegisterAccountMutation()

  useEffect(() => {
    const userData = Cookies.get("userData") ? JSON.parse(Cookies.get("userData") as string) : null
    if (userData) {
      navigate("/")
    }
  }, [navigate])

  const onFinish = async (values: RegisterFormData) => {
    try {
      const registerData = {
        ...values,
        gender: values.gender === "male" ? true : false,
      }

      await registerAccount(registerData).unwrap()

      notification.success({
        message: "Đăng ký thành công!",
        description: `Người dùng ${values.name} đã tạo tài khoản thành công với email đăng nhập là ${values.email}`,
        duration: 4.5,
      })

      // Reset form after successful registration
      form.resetFields()

      // Optionally navigate to login page after successful registration
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      notification.error({
        message: "Đăng ký thất bại!",
        description: error?.data?.message || "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.",
        duration: 4.5,
      })
    }
  }

  return (
    <Layout
      style={{
        minHeight: "calc(100vh - 124px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Content style={{ width: "80%", maxWidth: "1200px", display: "flex" }}>
        <Row gutter={[32, 32]} align="middle">
          {/* Hình ảnh minh họa */}
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <img
              src={Logo || "/placeholder.svg"}
              alt="Register"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "12px" }}
            />
          </Col>
          {/* Form đăng ký */}
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "100%",
                height: "auto",
              }}
            >
              <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
                Đăng Ký
              </Title>

              <Form form={form} name="register" onFinish={onFinish} layout="vertical" requiredMark={false}>
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                    { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên của bạn" size="large" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ email" size="large" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" size="large" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" size="large" />
                </Form.Item>

                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                >
                  <Select placeholder="Chọn giới tính" size="large">
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                  </Select>
                </Form.Item>

                <Form.Item style={{ marginBottom: "16px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isLoading}
                    style={{
                      width: "100%",
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
                  </Button>
                </Form.Item>
              </Form>

              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  gap: "8px",
                  justifyContent: "space-between",
                  marginTop: "16px",
                }}
              >
                <Button type="link" onClick={() => navigate("/")} style={{ padding: 0, margin: 0 }}>
                  Về lại trang chủ
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
