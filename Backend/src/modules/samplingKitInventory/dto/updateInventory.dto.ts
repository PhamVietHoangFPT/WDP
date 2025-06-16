import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator'

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Số lượng mẫu kit cần đặt', type: Number })
  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @ApiProperty({ description: 'Ngày nhập lô', type: Date })
  @IsNotEmpty()
  importDate: Date

  @ApiProperty({ description: 'Ngày hết hạn', type: Date })
  @IsNotEmpty()
  expDate: Date

  @ApiProperty({ description: 'Số lượng mẫu kit trong lô', type: Number })
  @IsNotEmpty()
  kitAmount: number

  @ApiProperty({ description: 'ID loại mẫu kit', type: String })
  @IsNotEmpty()
  @IsMongoId()
  sample: string
}
