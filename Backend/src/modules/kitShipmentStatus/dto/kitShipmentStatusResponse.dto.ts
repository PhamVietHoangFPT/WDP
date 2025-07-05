import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { KitShipmentStatus } from '../schemas/kitShipmentStatus.schema'

@Exclude()
export class KitShipmentStatusResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Tên trạng thái', type: String })
  status: string

  @Expose()
  @ApiProperty({ example: 1 })
  order: number

  constructor(partial: Partial<KitShipmentStatus>) {
    Object.assign(this, partial)
  }
}
