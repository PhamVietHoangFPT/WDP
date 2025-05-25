import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator'

export class CreateFacilityDto {
  @ApiProperty({
    example: 'Phòng khám Đa khoa ABC',
    description: 'Tên cơ sở y tế',
  })
  @IsNotEmpty()
  @IsString()
  facilityName: string

  @ApiProperty({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ của cơ sở y tế',
  })
  @IsNotEmpty()
  @IsMongoId()
  address: string

  @ApiProperty({
    example: '1234567890',
    description: 'Số điện thoại liên hệ của cơ sở y tế',
  })
  @IsNotEmpty()
  @IsString()
  contactNumber: string
}
