import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'
import { CreateTestResultShipmentDto } from './createTestResultShipment.dto'

export class UpdateTestResultShipmentDto {
  @ApiProperty({
    type: Date,
    example: '2023-10-01T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  testResultDispatchedDate?: Date

  @ApiProperty({
    type: Date,
    example: '2023-10-01T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  testResultDeliveryDate?: Date

  constructor(partial: Partial<CreateTestResultShipmentDto>) {
    Object.assign(this, partial)
  }
}
