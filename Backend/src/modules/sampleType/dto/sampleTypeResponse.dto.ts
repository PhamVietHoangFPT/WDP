/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { SampleType } from '../schemas/sampleType.schema'

@Exclude()
export class SampleTypeResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Mẫu loại chuẩn', type: String })
  name: string

  @Expose()
  @ApiProperty({ example: 1000000 })
  sampleTypeFee: number

  constructor(partial: Partial<SampleType>) {
    Object.assign(this, partial)
  }
}
