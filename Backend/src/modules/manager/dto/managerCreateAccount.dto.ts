/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import mongoose from 'mongoose'

export class ManagerCreateAccountDto {
  @ApiProperty({ example: 'Trần Văn C', required: true, minLength: 3 })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  name: string

  @ApiProperty({ example: 'vanc@example.com', required: true })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string

  @ApiProperty({
    example: '67f697151bfaa0e9cf14ec92',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: 'ID vai trò không được để trống' })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  role: mongoose.Schema.Types.ObjectId

  @ApiProperty({ example: true })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: boolean
}
