import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
@Expose()
export class TypeResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Blood' })
  name: string

  @Expose()
  @ApiProperty({ example: 10000 })
  typeFee: number

  @Expose()
  @ApiProperty({ example: true })
  isSpecial: boolean

  @Expose()
  @ApiProperty({ example: '6837d1f5286eb52dfd0579c6', required: true })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  condition: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Mẫu máu', required: false })
  description?: string

  @Expose()
  @ApiProperty({ example: true, required: true })
  isAdminstration: boolean

  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  deleted_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  deleted_by: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<TypeResponseDto>) {
    Object.assign(this, partial)
  }
}
