import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsMongoId } from 'class-validator'

export class UpdateBookingDto {
  @ApiProperty({ description: 'ID của slot', type: String })
  @IsMongoId()
  @IsNotEmpty()
  slot: string
}
