import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import mongoose from 'mongoose'

export class CreateKitShipmentDto {
  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID case member không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  caseMember: mongoose.Schema.Types.ObjectId
}
