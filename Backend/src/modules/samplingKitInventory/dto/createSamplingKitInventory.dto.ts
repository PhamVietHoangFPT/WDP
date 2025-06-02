import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator'

export class CreateSamplingKitInventoryDto {
  @ApiProperty({ description: 'Số lô', type: String })
  @IsString()
  @IsNotEmpty()
  lotNumber: string

  @ApiProperty({ description: 'Ngày nhập lô', type: Date })
  @IsNotEmpty()
  importDate: Date

  @ApiProperty({ description: 'Ngày hết hạn', type: Date })
  @IsNotEmpty()
  expDate: Date

  @ApiProperty({ description: 'Số lượng mẫu kit trong lô', type: Number })
  @IsNotEmpty()
  kitAmount: number

  @ApiProperty({ description: 'Số lượng mẫu kit hiện có', type: Number })
  @IsNotEmpty()
  inventory: number

  @ApiProperty({ description: 'Giá của mẫu kit', type: Number })
  @IsNotEmpty()
  price: number

  @ApiProperty({ description: 'ID cơ sở y tế', type: String })
  @IsNotEmpty()
  @IsMongoId()
  facility: string
}
