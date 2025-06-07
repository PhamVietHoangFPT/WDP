import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class UpdateTypeDto {
  @ApiProperty({
    example: 1500000,
    description: 'Giá mới của loại dịch vụ',
  })
  @IsNumber()
  price?: number
  @ApiProperty({
    example: 'Loại dịch vụ B',
    description: 'Tên mới của loại dịch vụ',
  })
  @IsString()
  name?: string
}
