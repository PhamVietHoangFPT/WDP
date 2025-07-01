import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator'

export class CreateSamplingKitInventoryDto {
  @ApiProperty({ description: 'Số lô', type: String })
  @IsString()
  @IsNotEmpty()
  lotNumber: string

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
