import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsMongoId } from 'class-validator'

export class UpdateAddressFacilityDto {
  @ApiProperty({
    example: '68304f7c968417cf51c133ad',
    description: 'Địa chỉ của cơ sở y tế',
  })
  @IsNotEmpty()
  @IsMongoId()
  address: string
}
