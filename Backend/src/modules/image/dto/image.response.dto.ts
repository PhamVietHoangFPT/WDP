import { ApiProperty } from '@nestjs/swagger'

export class ImageResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  url: string

  @ApiProperty({ required: false })
  testRequestHistoryTestRequestStatus?: string

  @ApiProperty({ required: false })
  testRequestHistoryTestRequest?: string

  @ApiProperty({ required: false })
  kitShipment?: string

  @ApiProperty({ required: false })
  testRequestShipmentHistoryShipmentStatus?: string

  @ApiProperty({ required: false })
  testRequestShipmentHistoryTestRequestShipment?: string

  @ApiProperty({ required: false })
  blog?: string

  @ApiProperty({ required: false })
  administrationDocument?: string

  constructor(partial: Partial<ImageResponseDto>) {
    Object.assign(this, {
      ...partial,
      id: partial['_id']?.toString?.() || '', // Convert ObjectId to string
    })
  }
}
