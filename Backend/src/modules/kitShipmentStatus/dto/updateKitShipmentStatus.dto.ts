import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateKitShipmentStatusDto {
  @ApiProperty({
    example: 'Tên trạng thái vận chuyển bộ kit',
  })
  @IsNotEmpty()
  @IsString()
  status: string

  @ApiProperty({
    example: 1,
    description: 'Thứ tự hiển thị của trạng thái vận chuyển bộ kit',
  })
  @IsNotEmpty()
  order: number
}
