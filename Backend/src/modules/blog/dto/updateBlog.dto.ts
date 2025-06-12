import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsMongoId } from 'class-validator'

export class UpdateBlogDto {
  @ApiPropertyOptional({
    example: 'Tiêu đề mới cho bài blog',
    description: 'Tiêu đề mới nếu cần cập nhật',
  })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({
    example: 'Mô tả mới cho bài blog',
    description: 'Mô tả mới nếu cần cập nhật',
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    example: 'Nội dung mới cho blog',
    description: 'Nội dung chi tiết cần cập nhật',
  })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID dịch vụ liên quan',
  })
  @IsOptional()
  @IsMongoId()
  service?: string

  @ApiPropertyOptional({
    example: '665b4f472ef540b5c6d6be42',
    description: 'ID tài khoản tác giả',
  })
  @IsOptional()
  @IsMongoId()
  account?: string

  @ApiPropertyOptional({
    example: '665b50102ef540b5c6d6be65',
    description: 'ID ảnh đại diện',
  })
  @IsOptional()
  @IsMongoId()
  image?: string
}
