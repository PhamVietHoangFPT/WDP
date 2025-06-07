import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTypeDto {
  @ApiProperty({
    example: 'Loại dịch vụ A',
    description: 'Tên loại dịch vụ',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: 1000000,
    description: 'Giá của loại dịch vụ',
  })
  @IsNotEmpty()
  price: number
}
