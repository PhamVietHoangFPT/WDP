import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { ShipmentStatus } from '../schemas/shipmentStatus.schema'

@Exclude()
export class ShipmentStatusResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: false })
  shipmentStatus: boolean

  constructor(partial: Partial<ShipmentStatus>) {
    Object.assign(this, partial)
  }
}
