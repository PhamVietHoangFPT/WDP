/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { CreateResultDto } from './createResult.dto'
import mongoose from 'mongoose'

export class UpdateResultDto {
  @ApiProperty({ example: 95, required: true })
  @IsNumber()
  @IsNotEmpty({ message: 'ADN Percentage không được để trống' })
  adnPercentage: number

  @ApiProperty({
    example: '682dbf1e3ecf256c0683b4d8',
    type: String,
    required: true,
  })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsNotEmpty({ message: 'Doctor ID không được để trống' })
  certifierId: mongoose.Schema.Types.ObjectId

  @ApiProperty({ example: 'Kết quả xét nghiệm ADN', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Kết luận không được để trống' })
  conclusion: string

  constructor(partial: Partial<CreateResultDto>) {
    Object.assign(this, partial)
  }
}
