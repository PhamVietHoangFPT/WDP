import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator'

export class CreateBlogDto {
  @ApiProperty({
    example: 'Cách chăm sóc sức khỏe mùa hè',
    description: 'Tiêu đề bài viết',
  })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({
    example: 'Mùa hè đến, thời tiết nắng nóng khiến cơ thể dễ bị mất nước...',
    description: 'Nội dung chính của bài viết',
  })
  @IsNotEmpty()
  @IsString()
  content: string

  @ApiProperty({
    example: 'Hướng dẫn chăm sóc sức khỏe mùa hè hiệu quả',
    description: 'Mô tả ngắn của bài viết',
  })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string

  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của dịch vụ liên kết',
  })
  @IsMongoId()
  @IsOptional()
  service?: string
}
