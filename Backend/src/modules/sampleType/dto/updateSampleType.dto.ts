import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class UpdateSampleTypeDto {
  @ApiProperty({
    example: 'Loại mẫu B',
    description: 'Tên mới của loại mẫu',
  })
  @IsString()
  name?: string

  @ApiProperty({
    example: 1500000,
    description: 'Giá mới của loại dịch vụ',
  })
  @IsNumber()
  sampleTypeFee?: number
}
