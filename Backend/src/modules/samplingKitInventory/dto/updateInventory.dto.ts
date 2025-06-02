import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Số lượng mẫu kit cần đặt', type: Number })
  @IsNotEmpty()
  @IsNumber()
  quantity: number
}
