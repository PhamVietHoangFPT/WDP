/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { TestTaker } from '../schemas/testTaker.schema'

@Exclude()
export class TestTakerResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string

  @Expose()
  @ApiProperty({ example: '123456789' })
  personalId: string

  @Expose()
  @ApiProperty({ example: '01234567890123456789' })
  phoneNumber: string

  @Expose()
  @ApiProperty({ example: true })
  gender: boolean

  @Expose()
  @ApiProperty({ example: '2005-09-23', type: String, format: 'date' })
  dateOfBirth: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  accountId: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<TestTaker>) {
    Object.assign(this, partial)
  }
}
