import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSampleTypeDto {
  @ApiProperty({
    example: 'Mẫu loại chuẩn',
    description: 'Tên loại mẫu',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: 1000000,
    description: 'Giá của loại dịch vụ',
  })
  @IsNotEmpty()
  sampleTypeFee: number
}
