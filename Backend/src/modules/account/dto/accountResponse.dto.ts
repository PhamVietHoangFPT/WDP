/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Account } from '../schemas/account.schema'

@Exclude()
export class AccountResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String }) // type String ở đây chỉ là gợi ý cho Swagger
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Trần Văn C' })
  name: string

  @Expose()
  @ApiProperty({ example: 'vanc@example.com' })
  email: string

  @Expose()
  @ApiProperty({ example: '0987654321' })
  phoneNumber: string

  // @Expose()
  // @ApiProperty({ type: Object })
  // role: any

  @Expose()
  @ApiProperty({ example: 'Customer', type: String })
  @Transform(({ value }) => value?.role, { toPlainOnly: true })
  role: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1c', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  facility: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: true })
  gender: boolean

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial)
  }
}
