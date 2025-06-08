/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { IsNotEmpty } from 'class-validator'
import { Sample } from '../schemas/sample.schema'

@Exclude()
export class SampleResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Blood' })
  name: string

  @Expose()
  @ApiProperty({ example: true })
  isSpecial: boolean

  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID tình trạng không được để trống' })
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

  constructor(partial: Partial<Sample>) {
    Object.assign(this, partial)
  }
}
