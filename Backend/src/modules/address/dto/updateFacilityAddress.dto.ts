import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateAddressFacilityForAddressDto {
  @ApiProperty({
    example: 'Test data',
    description: 'Địa chỉ đầy đủ của cơ sở y tế',
  })
  @IsNotEmpty()
  fullAddress: string
}
