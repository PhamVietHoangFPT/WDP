/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { Facility } from '../schemas/facility.schema'
import mongoose from 'mongoose'

@Exclude()
export class FacilityResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String }) // type String chỉ là gợi ý cho Swagger
  _id: string

  @Expose()
  @ApiProperty({ example: 'Phòng khám ABC' })
  name: string

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  address: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '0987654321' })
  phoneNumber: string

  constructor(partial: Partial<Facility>) {
    Object.assign(this, partial)
  }
}
