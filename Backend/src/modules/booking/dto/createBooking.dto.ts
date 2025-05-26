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

  @ApiProperty({ description: 'Ghi chú', type: String })
  @IsString()
  @IsNotEmpty()
  note: string
}
