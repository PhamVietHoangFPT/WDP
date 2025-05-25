/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Slot } from '../schemas/slot.schema'

@Exclude()
export class SlotResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String }) // type String ở đây chỉ là gợi ý cho Swagger
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '2023-10-01T10:00:00Z' })
  slotDate: Date

  @Expose()
  @ApiProperty({ example: '2023-10-01T10:00:00Z' })
  startTime: Date

  @Expose()
  @ApiProperty({ example: '2023-10-01T11:00:00Z' })
  endTime: Date

  @Expose()
  @ApiProperty({ example: false, type: Boolean })
  isBooked: boolean

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  slotTemplate: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<Slot>) {
    Object.assign(this, partial)
  }
}
