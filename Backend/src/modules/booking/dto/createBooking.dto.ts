import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator'

export class CreateBookingDto {
  @ApiProperty({ description: 'ID của slot', type: String })
  @IsMongoId()
  @IsNotEmpty()
  slot: string

  @ApiProperty({ description: 'ID của tài khoản', type: String })
  @IsMongoId()
  @IsNotEmpty()
  account: string

  @ApiProperty({ description: 'ID của phương thức thanh toán', type: String })
  @IsMongoId()
  @IsNotEmpty()
  payment: string

  @ApiProperty({ description: 'Ngày đặt', type: Date })
  @IsNotEmpty()
  bookingDate: Date

  @ApiProperty({ description: 'Ghi chú', type: String })
  @IsString()
  @IsNotEmpty()
  note: string
}
