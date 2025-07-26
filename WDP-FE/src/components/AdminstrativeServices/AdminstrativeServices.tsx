'use client'

import React, { useState, useEffect } from 'react'
import {
  Typography,
  Spin,
  Alert,
  Space,
  Card,
  Button,
  Row,
  Col,
  notification,
} from 'antd'
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CompassOutlined,
  ReloadOutlined,
} from '@ant-design/icons' // Thêm ReloadOutlined
import { useGetAllFacilitiesDetailQuery } from '../../features/customer/adminstrativeAPI'

const { Title, Text, Paragraph } = Typography

// CSS cho ellipsis đa dòng (web-kit-box)
const multiLineEllipsisStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2, // Giới hạn 2 dòng cho địa chỉ
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1.4em', // Điều chỉnh line-height cho khớp với số dòng
  maxHeight: '2.8em', // 2 dòng * 1.4em
} as React.CSSProperties

// CSS cho ellipsis một dòng
const singleLineEllipsisStyle = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  display: 'block' as const,
  width: '100%',
}

// Định nghĩa kiểu dữ liệu cho Address
interface Address {
  _id: string
  fullAddress: string
  location: {
    type: string
    coordinates: number[] // [longitude, latitude]
  }
}

// Định nghĩa kiểu dữ liệu cho Manager account trong facility
interface FacilityManagerAccount {
  _id: string
  email: string
  phoneNumber: string
  name?: string
}

// Định nghĩa kiểu dữ liệu cho Facility Detail
interface FacilityDetail {
  _id: string
  facilityName: string
  phoneNumber: string
  account: FacilityManagerAccount | null
  address: Address
  distance?: number // Thêm trường khoảng cách để lưu trữ và sắp xếp
}

// Hàm tính khoảng cách giữa hai điểm dựa trên vĩ độ và kinh độ (công thức Haversine)
// Trả về khoảng cách bằng km
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Bán kính Trái Đất bằng km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance // Khoảng cách bằng km
}

export default function AdministrativeService() {
  const {
    data: facilitiesData,
    isLoading: isFacilitiesLoading,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useGetAllFacilitiesDetailQuery({})

  // State để lưu vị trí người dùng [latitude, longitude]
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  )
  // State để lưu danh sách cơ sở đã được lọc/sắp xếp
  const [filteredFacilities, setFilteredFacilities] = useState<
    FacilityDetail[]
  >([])
  // State để kiểm soát trạng thái đang lọc (khi đang lấy vị trí)
  const [isFiltering, setIsFiltering] = useState<boolean>(false)

  // Cập nhật filteredFacilities khi facilitiesData thay đổi hoặc userLocation thay đổi
  useEffect(() => {
    if (facilitiesData?.data) {
      if (userLocation) {
        const facilitiesWithDistance = facilitiesData.data.map(
          (facility: FacilityDetail) => {
            if (
              facility.address?.location?.coordinates &&
              facility.address.location.coordinates.length === 2
            ) {
              // Đảm bảo tọa độ có đủ [longitude, latitude]
              const lonFacility = facility.address.location.coordinates[0]
              const latFacility = facility.address.location.coordinates[1]
              const distance = calculateDistance(
                userLocation[0], // latitude người dùng
                userLocation[1], // longitude người dùng
                latFacility, // latitude cơ sở
                lonFacility // longitude cơ sở
              )
              return { ...facility, distance }
            }
            console.warn(
              `Facility ${facility.facilityName} has invalid or missing coordinates. Setting distance to Infinity.`
            )
            return { ...facility, distance: Infinity } // Nếu không có tọa độ hợp lệ, đặt khoảng cách vô cùng lớn
          }
        )
        // Sắp xếp theo khoảng cách tăng dần
        const sortedFacilities = [...facilitiesWithDistance].sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        )
        setFilteredFacilities(sortedFacilities)
      } else {
        // Nếu không có vị trí người dùng, hiển thị danh sách gốc
        setFilteredFacilities(facilitiesData.data)
      }
    } else {
      setFilteredFacilities([]) // Đảm bảo rỗng nếu data chưa về
    }
  }, [facilitiesData, userLocation])

  // Hàm lấy vị trí người dùng
  const getUserLocation = () => {
    setIsFiltering(true)
    notification.info({
      message: 'Đang tìm vị trí của bạn...',
      description: 'Vui lòng chờ hoặc cấp quyền truy cập vị trí.',
      placement: 'topRight',
      duration: 3,
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setUserLocation([latitude, longitude])
        setIsFiltering(false)
        notification.success({
          message: 'Thành công',
          description: 'Đã tìm thấy vị trí của bạn và lọc các cơ sở gần nhất.',
          placement: 'topRight',
        })
      })
    } else {
      setIsFiltering(false)
      notification.warning({
        message: 'Trình duyệt không hỗ trợ',
        description: 'Trình duyệt của bạn không hỗ trợ Geolocation API.',
        placement: 'topRight',
      })
      setUserLocation(null) // Đảm bảo clear vị trí nếu có lỗi
      setFilteredFacilities(facilitiesData?.data || []) // Về lại danh sách gốc
      console.error('Geolocation not supported by browser.')
    }
  }

  // Hàm để reset bộ lọc
  const resetFilter = () => {
    setUserLocation(null)
    // Khi reset, filteredFacilities sẽ tự động được cập nhật bởi useEffect do userLocation thay đổi
    notification.info({
      message: 'Đặt lại bộ lọc',
      description: 'Đã hiển thị lại tất cả các cơ sở.',
      placement: 'topRight',
    })
  }

  if (isFacilitiesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size='large' tip='Đang tải danh sách cơ sở...' />
      </div>
    )
  }

  if (facilitiesError) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert
          message='Lỗi khi tải dữ liệu'
          description={
            facilitiesError?.message ||
            (facilitiesError.data
              ? JSON.stringify(facilitiesError.data)
              : 'Đã có lỗi xảy ra khi tải danh sách cơ sở. Vui lòng thử lại.')
          }
          type='error'
          showIcon
          action={
            <Button size='small' onClick={() => refetchFacilities()}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  // Chọn danh sách để hiển thị
  const facilitiesToDisplay = filteredFacilities // Luôn dùng filteredFacilities vì nó được quản lý bởi useEffect

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ color: '#0056b3', marginBottom: 20 }}>
        Dịch vụ Hành chính
      </Title>

      <Card
        style={{
          marginBottom: 24,
          backgroundColor: '#e6f7ff',
          borderColor: '#91d5ff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
        }}
      >
        <Paragraph
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1890ff',
            margin: 0,
          }}
        >
          <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Các dịch vụ hành chính vui lòng liên hệ trực tiếp với quản lý của cơ
          sở tương ứng để được hỗ trợ.
        </Paragraph>
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0, color: '#0056b3' }}>
          Thông tin liên hệ các Cơ sở
        </Title>
        <Space>
          {userLocation ? ( // Chỉ hiển thị nút reset khi đã có vị trí người dùng (đã lọc)
            <Button
              type='default'
              onClick={resetFilter}
              icon={<ReloadOutlined />}
            >
              Hiển thị tất cả
            </Button>
          ) : null}
          <Button
            type='primary'
            icon={<CompassOutlined />}
            onClick={getUserLocation}
            loading={isFiltering}
            disabled={isFiltering}
          >
            {isFiltering ? 'Đang tìm vị trí...' : 'Lọc cơ sở gần nhất'}
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
        {facilitiesToDisplay.length > 0 ? (
          facilitiesToDisplay.map((facility) => (
            <Col xs={24} sm={12} md={8} lg={6} key={facility._id}>
              <Card
                title={
                  <Space>
                    <Text
                      strong
                      ellipsis={{ tooltip: facility.facilityName }}
                      style={{ fontSize: '1.1em', color: '#333' }}
                    >
                      {facility.facilityName}
                    </Text>
                  </Space>
                }
                bordered={true}
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  padding: '16px 24px',
                }}
                headStyle={{
                  backgroundColor: '#f0f2f5',
                  borderBottom: '1px solid #e8e8e8',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              >
                {/* Hiển thị khoảng cách nếu có userLocation */}
                {userLocation &&
                facility.distance !== undefined &&
                facility.distance !== Infinity ? (
                  <Paragraph
                    style={{
                      marginBottom: 12,
                      textAlign: 'center',
                      fontSize: '0.9em',
                      color: '#888',
                    }}
                  >
                    Cách bạn:{' '}
                    <Text strong style={{ color: '#0056b3' }}>
                      {facility.distance.toFixed(2)} km
                    </Text>
                  </Paragraph>
                ) : null}

                {/* Phần bản đồ luôn ở trên cùng body của card */}
                {facility.address?.location?.coordinates &&
                facility.address.location.coordinates.length === 2 ? (
                  <div
                    style={{
                      marginBottom: 16,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid #e8e8e8',
                    }}
                  >
                    <iframe
                      // SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY: SỬ DỤNG CÚ PHÁP ĐÚNG CỦA GOOGLE MAPS EMBED API
                      src={`https://maps.google.com/maps?q=${facility.address.location.coordinates[1]},${facility.address.location.coordinates[0]}&z=15&output=embed`}
                      width='100%'
                      height='150'
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading='lazy'
                      referrerPolicy='no-referrer-when-downgrade'
                      title={`Google Map for ${facility.facilityName}`}
                    ></iframe>
                  </div>
                ) : (
                  <div
                    style={{
                      marginBottom: 16,
                      textAlign: 'center',
                      padding: '20px 0',
                      border: '1px dashed #d9d9d9',
                      borderRadius: 8,
                    }}
                  >
                    <Text type='secondary' style={{ fontSize: '0.9em' }}>
                      Không có vị trí bản đồ.
                    </Text>
                  </div>
                )}

                {/* Phần thông tin cơ sở: cố định chiều cao */}
                <div style={{ minHeight: 70, marginBottom: 12, flexShrink: 0 }}>
                  <Paragraph style={{ marginBottom: 4 }}>
                    <EnvironmentOutlined
                      style={{ marginRight: 8, color: '#52c41a' }}
                    />
                    <Text strong>Địa chỉ:</Text>{' '}
                    <Text
                      style={multiLineEllipsisStyle}
                      title={facility.address?.fullAddress}
                    >
                      {facility.address?.fullAddress || 'N/A'}
                    </Text>
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    <PhoneOutlined
                      style={{ marginRight: 8, color: '#faad14' }}
                    />
                    <Text strong>SĐT Cơ sở:</Text>{' '}
                    <Text
                      style={singleLineEllipsisStyle}
                      title={facility.phoneNumber}
                    >
                      {facility.phoneNumber}
                    </Text>
                  </Paragraph>
                </div>

                {/* Phần thông tin Manager: luôn chiếm cùng không gian, có hoặc không có nội dung */}
                <div
                  style={{
                    flexGrow: 1,
                    minHeight: 100,
                    marginTop: 15,
                    paddingLeft: 10,
                    borderLeft: '3px solid #f0f2f5',
                  }}
                >
                  <Text
                    strong
                    style={{ display: 'block', marginBottom: 8, color: '#333' }}
                  >
                    <UserOutlined
                      style={{ marginRight: 8, color: '#eb2f96' }}
                    />{' '}
                    Nhân viên Quản lý:
                  </Text>
                  {facility.account ? (
                    <Space
                      direction='vertical'
                      size={4}
                      style={{ width: '100%', paddingLeft: 12 }}
                    >
                      {facility.account.name && (
                        <Paragraph style={{ marginBottom: 2 }}>
                          <Text
                            strong
                            style={singleLineEllipsisStyle}
                            title={facility.account.name}
                          >
                            {facility.account.name}
                          </Text>
                        </Paragraph>
                      )}
                      <Paragraph style={{ marginBottom: 2 }}>
                        <MailOutlined
                          style={{ marginRight: 8, color: '#faad14' }}
                        />
                        <Text
                          type='secondary'
                          style={singleLineEllipsisStyle}
                          title={facility.account.email}
                        >
                          {facility.account.email}
                        </Text>
                      </Paragraph>
                      <Paragraph style={{ marginBottom: 0 }}>
                        <PhoneOutlined
                          style={{ marginRight: 8, color: '#faad14' }}
                        />
                        <Text
                          type='secondary'
                          style={singleLineEllipsisStyle}
                          title={facility.account.phoneNumber}
                        >
                          {facility.account.phoneNumber}
                        </Text>
                      </Paragraph>
                    </Space>
                  ) : (
                    <Paragraph style={{ paddingLeft: 12 }}>
                      <Text type='secondary'>Chưa có thông tin quản lý.</Text>
                    </Paragraph>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 15,
                    textAlign: 'center',
                  }}
                >
                  <Text type='secondary' style={{ fontSize: '0.85em' }}>
                    Thông tin được cập nhật thường xuyên.
                  </Text>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24} style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type='secondary'>
              Không có dữ liệu cơ sở nào để hiển thị.
            </Text>
          </Col>
        )}
      </Row>
    </div>
  )
}
