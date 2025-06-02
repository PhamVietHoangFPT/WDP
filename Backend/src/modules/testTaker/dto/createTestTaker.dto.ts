/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator'
import mongoose from 'mongoose'

export class CreateTestTakerDto {
  @ApiProperty({ example: 'Nguyễn Văn A', required: true, minLength: 3 })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: '123456789012', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Số định danh cá nhân không được để trống' })
  personalId: string

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: boolean

  @ApiProperty({ example: '2005-09-23', type: String, format: 'date' })
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng' })
  dateOfBirth: Date

  @ApiProperty({
    example: '682dbf1e3ecf256c0683b4d8',
    type: String,
    required: true,
  })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  @IsNotEmpty({ message: 'AccountId không được để trống' })
  accountId: mongoose.Schema.Types.ObjectId

  @ApiProperty({
    example: '682dbf1e3ecf256c0683b4d8',
    type: String,
    required: false,
  })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  testTakerRelationshipId?: mongoose.Schema.Types.ObjectId
}
