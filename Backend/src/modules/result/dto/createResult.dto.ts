/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, IsNotEmpty } from 'class-validator'
import mongoose from 'mongoose'

export class CreateResultDto {
  @ApiProperty({ example: 95, required: true })
  adnPercentage: number

  @ApiProperty({
    example: '682dbf1e3ecf256c0683b4d8',
    type: String,
    required: true,
  })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsNotEmpty({ message: 'Doctor ID không được để trống' })
  doctorId: mongoose.Schema.Types.ObjectId

  @ApiProperty({ example: 'Kết quả xét nghiệm ADN', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Kết luận không được để trống' })
  conclusion: string

  @ApiProperty({
    example: '682dbf1e3ecf256c0683b4d8',
    type: String,
    required: true,
  })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsNotEmpty({ message: 'Service Case ID không được để trống' })
  serviceCase: mongoose.Schema.Types.ObjectId
}
