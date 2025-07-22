import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

export class CreateTestResultShipmentDto {
  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2023-10-01T00:00:00.000Z',
  })
  @IsDateString()
  testResultDispatchedDate?: Date

  @ApiProperty({
    type: Date,
    nullable: true,
    example: '2023-10-01T00:00:00.000Z',
  })
  @IsDateString()
  testResultDeliveryDate?: Date

  constructor(partial: Partial<CreateTestResultShipmentDto>) {
    Object.assign(this, partial)
  }
}
