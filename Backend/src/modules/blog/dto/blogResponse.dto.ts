import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform, Type } from 'class-transformer'
import mongoose from 'mongoose'
import { Blog } from '../schemas/blog.schema'
export class SimpleAccountDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  email: string
}

export class SimpleImageDto {
  @ApiProperty()
  url: string
}

@Exclude()
export class BlogResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(
    ({ value }) =>
      value ? (value as mongoose.Types.ObjectId).toString() : null,
    {
      toPlainOnly: true,
    },
  )
  _id: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Cách chăm sóc sức khỏe mùa hè' })
  title: string

  @Expose()
  @ApiProperty({ example: 'Hướng dẫn chăm sóc sức khỏe mùa hè hiệu quả' })
  description: string

  @Expose()
  @ApiProperty({ example: 'Nội dung chi tiết về cách chăm sóc sức khỏe...' })
  content: string

  @Expose()
  @ApiProperty({ example: '665b4f2a2ef540b5c6d6be3e', type: String })
  @Transform(
    ({ value }) =>
      value ? (value as mongoose.Types.ObjectId).toString() : null,
    {
      toPlainOnly: true,
    },
  )
  service: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({
    example: { name: 'Trần Văn C', email: 'staff@staff.com' },
  })
  @Type(() => SimpleAccountDto)
  account: SimpleAccountDto

  @Expose()
  @ApiProperty({
    example: { url: '/uploads/image.png' },
  })
  @Type(() => SimpleImageDto)
  image?: SimpleImageDto

  @Expose()
  @ApiProperty({ example: false })
  isDeleted: boolean

  constructor(partial: Partial<Blog | BlogResponseDto>) {
    Object.assign(this, partial)
  }
}
