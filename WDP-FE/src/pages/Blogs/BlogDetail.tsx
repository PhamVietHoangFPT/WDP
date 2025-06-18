// src/pages/BlogDetail.tsx
import { useParams } from 'react-router-dom'
import { Card, Typography, Divider, Image } from 'antd'
import { useGetBlogByIdQuery } from '../../features/admin/blogAPI'

const { Title, Paragraph } = Typography
const BASE_URL = import.meta.env.VITE_API_ENDPOINT

export default function BlogDetail() {
  const { id } = useParams()
  const { data, isLoading } = useGetBlogByIdQuery(id || '')

  if (isLoading || !data) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        Đang tải dữ liệu...
      </div>
    )
  }

  const { title, content, description, image, created_by } = data

  return (
    <Card style={{ margin: 24 }}>
      <Title level={2}>{title}</Title>
      <Paragraph type='secondary'>{description}</Paragraph>

      <Divider />

      {image?.map((img, idx) => (
        <Image
          key={idx}
          src={BASE_URL + img.url}
          alt={`img-${idx}`}
          style={{ maxHeight: 300, marginBottom: 16, objectFit: 'cover' }}
        />
      ))}

      <Paragraph style={{ whiteSpace: 'pre-line' }}>{content}</Paragraph>

      <Divider />
      <Paragraph strong>Người viết: {created_by?.name}</Paragraph>
      <Paragraph type='secondary'>Email: {created_by?.email}</Paragraph>
    </Card>
  )
}
