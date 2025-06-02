/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { SamplingKitInventory } from '../schemas/samplingKitInventory.schema'

@Exclude()
export class SamplingKitInventoryResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String }) // type String ở đây chỉ là gợi ý cho Swagger
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Lot12345' })
  lotNumber: string

  @Expose()
  @ApiProperty({ example: '2023-10-01T10:00:00Z' })
  importDate: Date

  @Expose()
  @ApiProperty({ example: '2024-10-01T10:00:00Z' })
  expDate: Date

  @Expose()
  @ApiProperty({ example: 100, type: Number })
  kitAmount: number

  @Expose()
  @ApiProperty({ example: 50, type: Number })
  inventory: number

  @Expose()
  @ApiProperty({ example: 2000, type: Number })
  price: number

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  facility: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<SamplingKitInventory>) {
    Object.assign(this, partial)
  }
}
