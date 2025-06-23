import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsBoolean, IsMongoId } from 'class-validator'

export class CreateAddressDto {
  @ApiProperty({ example: 'Số 1, Phường A, Quận B, TP. HCM' })
  @IsNotEmpty()
  @IsString()
  fullAddress: string

  @ApiProperty({ example: true })
  @IsBoolean()
  isKitShippingAddress?: boolean

  @ApiProperty({ example: '682dbf1e3ecf256c0683b4d8' })
  @IsMongoId()
  account?: string
}
