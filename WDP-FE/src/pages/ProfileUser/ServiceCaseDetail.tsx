import { Card, Typography, Timeline, Spin, Button, Image, Space } from 'antd' // Import Image and Space
import { useParams } from 'react-router-dom'
import { useGetTestRequestHistoryQuery, useGetImageQuery } from '../../features/customer/paymentApi' // Import useGetImageQuery
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react' // Import useState and useEffect

const { Title, Text } = Typography

export default function ServiceCaseDetail() {
  const { id } = useParams() // serviceCaseId
  const userData = Cookies.get('userData')

  let accountId = ''
  try {
    accountId = userData ? JSON.parse(userData).id : ''
  } catch (error) {
    console.error('Failed to parse userData cookie:', error)
  }

  const { data, isLoading } = useGetTestRequestHistoryQuery({
    accountId,
    serviceCaseId: id,
  })

  // Sử dụng useGetImageQuery để lấy danh sách ảnh
  const { data: imageData, isLoading: isLoadingImages } = useGetImageQuery(id as string, {
    skip: !id, // Chỉ gọi API khi có id
  })

  const [fullImageUrls, setFullImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (imageData && imageData.length > 0) {
      const urls = imageData.map((img: any) => `http://localhost:5000${img.url}`);
      setFullImageUrls(urls);
    } else {
      setFullImageUrls([]);
    }
  }, [imageData]);


  const sortedData = [...(data?.data || [])].sort(
    (a, b) => a.testRequestStatus.order - b.testRequestStatus.order
  )

  return (
    <div>
      <Card style={{ margin: '30px auto', maxWidth: 800 }}>
        <Title level={3} style={{ paddingBottom: '30px' }}>
          Trạng thái hồ sơ
        </Title>
        {isLoading ? (
          <Spin />
        ) : (
          <Timeline mode='left'>
            {sortedData.map((item, index) => (
              <Timeline.Item
                key={item._id}
                color={index === sortedData.length - 1 ? 'green' : 'blue'}
              >
                <Text strong>
                  {new Date(item.created_at).toLocaleString('vi-VN')}
                </Text>
                <br />
                <Text>{item.testRequestStatus.testRequestStatus}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        )}

        {/* --- Hiển thị ảnh --- */}
        <Title level={4} style={{ marginTop: '40px', marginBottom: '20px' }}>
          Hình ảnh liên quan
        </Title>
        {isLoadingImages ? (
          <Spin />
        ) : fullImageUrls.length > 0 ? (
          <Space wrap size={16}> {/* Display images in a flex container */}
            {fullImageUrls.map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Service Case Image ${index + 1}`}
                // style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover'}}
                // Optional: add preview prop for full-size viewing
                preview={{ visible: false }} // Keep it false initially
                onClick={() => {
                  // Open full image in new tab or show in custom modal if needed
                  window.open(url, '_blank');
                }}
              />
            ))}
          </Space>
        ) : (
          <Text type="secondary">Chưa có hình ảnh nào cho hồ sơ này.</Text>
        )}
        {/* --- Kết thúc phần hiển thị ảnh --- */}

        <Button
          type='primary'
          style={{ marginTop: 16 }}
          onClick={() => window.history.back()}
        >
          Trở về
        </Button>
      </Card>
    </div>
  )
}