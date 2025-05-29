import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class PaymentBookingDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_BOOKING_ID',
    description: 'ID đặt chỗ của người dùng',
    required: true,
  })
  @IsMongoId({ message: 'ID đặt chỗ không hợp lệ' })
  bookingId: string
}
