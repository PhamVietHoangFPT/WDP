import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CreatePaymentHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentStatus: string

  @ApiProperty()
  @IsNotEmpty()
  payDate: string

  @ApiProperty()
  @IsNotEmpty()
  transactionId: string
}
