/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
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
  @ApiProperty({ example: 100000 })
  fee: number

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  sampleType: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  deleted_at: Date | null

  constructor(partial: Partial<Sample>) {
    Object.assign(this, partial)
  }
}
