// src/pages/Blog.tsx
import { Card, List, Typography, Image } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useGetBlogsQuery } from '../../features/admin/blogAPI'

const { Title, Paragraph } = Typography
const BASE_URL = import.meta.env.VITE_API_ENDPOINT

export default function Blog() {
  const { data, isLoading } = useGetBlogsQuery(undefined)
  const navigate = useNavigate()
  const blogs = data?.data ?? []

  return (
    <Card style={{ margin: 24 }}>
      <Title level={2}>Danh sách bài viết</Title>
      <List
        loading={isLoading}
        dataSource={blogs}
        itemLayout='horizontal'
        renderItem={(item) => (
          <List.Item
            onClick={() => navigate(`/blogs/${item._id}`)}
            style={{
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ marginBottom: 0 }}>
                {item.title}
              </Title>
              <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
            </div>

            {item.image?.[0]?.url && (
              <Image
                src={BASE_URL + item.image[0].url}
                alt='thumbnail'
                width={100}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                preview={false}
              />
            )}
          </List.Item>
        )}
      />
    </Card>
  )
}
