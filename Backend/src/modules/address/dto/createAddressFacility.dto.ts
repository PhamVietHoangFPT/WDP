import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateAddressFacilityDto {
  @ApiProperty({ example: 'Số 1, Phường A, Quận B, TP. HCM' })
  @IsNotEmpty()
  @IsString()
  fullAddress: string
}
