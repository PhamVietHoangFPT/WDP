/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import mongoose from 'mongoose'

export class CreateSampleDto {
  @ApiProperty({ example: 'Blood', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: 100000, required: true })
  @IsNumber()
  @IsNotEmpty({ message: 'Giá không được để trống' })
  fee: number

  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID tình trạng không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  sampleType: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<CreateSampleDto>) {
    Object.assign(this, partial)
  }
}
