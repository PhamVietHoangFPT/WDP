import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class WardDto {
  @ApiProperty({ example: '22333', description: 'Mã của phường/xã' })
  @IsString()
  @IsNotEmpty()
  Code: string

  @ApiProperty({
    example: 'Phường Vĩnh Hải',
    description: 'Tên đầy đủ của phường/xã',
  })
  @IsString()
  @IsNotEmpty()
  FullName: string

  @ApiProperty({
    example: '56',
    description: 'Mã của tỉnh/thành phố trực thuộc',
  })
  @IsString()
  @IsNotEmpty()
  ProvinceCode: string
}
