/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, IsNotEmpty, Matches } from 'class-validator'
import mongoose from 'mongoose'

export class CreateSlotTemplateDto {
  @ApiProperty({ example: '09:00:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    // HH:mm:ss
    message: 'Thời gian bắt đầu phải có định dạng HH:mm:ss',
  })
  workTimeStart: string

  @ApiProperty({ example: '17:00:00', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    // HH:mm:ss
    message: 'Thời gian kết thúc phải có định dạng HH:mm:ss',
  })
  workTimeEnd: string

  @ApiProperty({ example: 1.5, required: true })
  @IsNotEmpty({ message: 'Thời gian mỗi slot không được để trống' })
  @Transform(({ value }) => Number(value), { toPlainOnly: true })
  slotDuration: number

  @ApiProperty({ example: '67f697151bfaa0e9cf14ec92', required: true })
  @IsNotEmpty({ message: 'Cơ sở không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  facility: mongoose.Schema.Types.ObjectId
}
