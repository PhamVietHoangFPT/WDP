/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { CaseMember } from '../schemas/caseMember.schema'

@Exclude()
export class CaseMemberResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  testTaker: mongoose.Schema.Types.ObjectId[]

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  samplingKitInventory: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  booking: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '665b4f2a2ef540b5c6d6be3e', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  service: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  created_by: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  image?: mongoose.Schema.Types.ObjectId[]
  constructor(partial: Partial<CaseMember>) {
    Object.assign(this, partial)
  }
}
