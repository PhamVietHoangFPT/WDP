/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { CaseMember } from '../schemas/caseMember.schema'

// Hàm helper để biến đổi một ObjectId thành chuỗi
const transformObjectId = ({ value }) => value?.toString()

// Hàm helper để biến đổi MẢNG ObjectId thành MẢNG chuỗi
const transformObjectIdArray = ({ value }) => value?.map((id) => id.toString())

@Exclude()
export class CaseMemberResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  _id: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({
    example: ['605e3f5f4f3e8c1d4c9f1e1a', '605e3f5f4f3e8c1d4c9f1e1b'],
    type: [String],
  })
  @Transform(transformObjectIdArray, { toPlainOnly: true })
  testTaker: mongoose.Types.ObjectId[]

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  samplingKitInventory: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  booking: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '665b4f2a2ef540b5c6d6be3e', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  service: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '665b4f2a2ef540b5c6d6be3e', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  slot: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  created_by: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({
    example: ['605e3f5f4f3e8c1d4c9f1e1c', '605e3f5f4f3e8c1d4c9f1e1d'],
    type: [String], // SỬA: Khai báo đây là mảng các chuỗi
    required: false,
  })
  @Transform(transformObjectIdArray, { toPlainOnly: true }) // SỬA: Dùng hàm transform cho mảng
  image?: mongoose.Types.ObjectId[]

  constructor(partial: Partial<CaseMember>) {
    Object.assign(this, partial)
  }
}
