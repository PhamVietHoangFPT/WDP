import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ProvinceDto {
  @ApiProperty({ example: '56', description: 'Mã của tỉnh/thành phố' })
  @IsString()
  @IsNotEmpty()
  Code: string

  @ApiProperty({
    example: 'Tỉnh Khánh Hòa',
    description: 'Tên đầy đủ của tỉnh/thành phố',
  })
  @IsString()
  @IsNotEmpty()
  FullName: string
}
