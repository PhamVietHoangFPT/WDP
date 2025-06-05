/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Blog } from '../schemas/blog.schema'

@Exclude()
export class BlogResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

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
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  service: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  account: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  image?: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: false })
  isDeleted: boolean

  constructor(partial: Partial<Blog>) {
    Object.assign(this, partial)
  }
}
