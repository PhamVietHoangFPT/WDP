import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CheckVnPayPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  vnp_Amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_BankCode: string

  @ApiProperty()
  vnp_BankTranNo: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_CardType: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_OrderInfo: string

  @ApiProperty()
  @IsNotEmpty()
  vnp_PayDate: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_ResponseCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TransactionNo: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TransactionStatus: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TxnRef: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string
}
