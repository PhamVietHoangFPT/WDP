import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import mongoose from 'mongoose'

export class CreateServiceDto {
  @ApiProperty({
    example: 10000,
    description: 'Giá của dịch vụ',
  })
  @IsNotEmpty()
  @IsNumber()
  fee: number

  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID thời gian trả mẫu không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  timeReturn: mongoose.Schema.Types.ObjectId

  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID thời gian trả mẫu không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  sample: mongoose.Schema.Types.ObjectId

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isAgnate: boolean

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isAdministration: boolean

  @ApiProperty({
    example: "Blood",
    description: 'Tên của dịch vụ',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  isSelfSampling: boolean
  
  constructor(partial: Partial<CreateServiceDto>) {
    Object.assign(this, partial)
  }
}
