import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { TimeReturn } from '../schemas/timeReturn.schema'

@Exclude()
export class TimeReturnResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 5 })
  timeReturn: number

  @Expose()
  @ApiProperty({ example: 10000 })
  timeReturnFee: number

  @Expose()
  @ApiProperty({ example: 'string' })
  description?: string

  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  deleted_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  deleted_by: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<TimeReturn>) {
    Object.assign(this, partial)
  }
}
