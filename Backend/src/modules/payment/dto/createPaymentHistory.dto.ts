import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CreatePaymentHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionStatus: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  responseCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payDate: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionReferenceNumber: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderInfo: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionNo: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tmnCode: string
}
