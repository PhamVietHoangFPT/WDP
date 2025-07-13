import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Service } from '../schemas/service.schema'

@Exclude()
export class ServiceResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 10000 })
  fee: number

  @Expose()
  @ApiProperty({ example: true })
  isAgnate: boolean

  @Expose()
  @ApiProperty({ example: true })
  isAdministration: boolean

  @Expose()
  @ApiProperty({ example: true })
  isSelfSampling: boolean

  @Expose()
  @ApiProperty({ example: "Blood" })
  name: string

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  timeReturn: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  sample: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  deleted_at: Date | null

  constructor(partial: Partial<Service>) {
    Object.assign(this, partial)
  }
}
