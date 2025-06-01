import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Condition } from '../schemas/condition.schema'

@Exclude()
export class ConditionResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Normal' })
  name: string

  @Expose()
  @ApiProperty({ example: 10000 })
  conditionFee?: number

  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  created_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  created_by: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  updated_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  updated_by: mongoose.Schema.Types.ObjectId


  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  deleted_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  deleted_by: mongoose.Schema.Types.ObjectId
  
  constructor(partial: Partial<Condition>) {
    Object.assign(this, partial)
  }
}
