/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { SlotTemplate } from '../schemas/slotTemplate.schema'

@Exclude()
export class SlotTemplateResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String }) // type String ở đây chỉ là gợi ý cho Swagger
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: true })
  isSunday: boolean

  @Expose()
  @ApiProperty({ example: '09:00:00' })
  workTimeStart: string

  @Expose()
  @ApiProperty({ example: '17:00:00' })
  workTimeEnd: string

  @Expose()
  @ApiProperty({ example: 1.5 })
  @Transform(({ value }) => Number(value), { toPlainOnly: true })
  slotDuration: number

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String }) // type String ở đây chỉ là gợi ý cho Swagger
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  facilityId: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<SlotTemplate>) {
    Object.assign(this, partial)
  }
}
