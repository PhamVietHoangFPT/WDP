/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Address } from '../schemas/address.schema'
import { Transform } from 'class-transformer'
import mongoose from 'mongoose'

export class AddressResponseDto {
  @ApiProperty()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @ApiProperty()
  fullAddress: string

  @ApiProperty()
  isKitShippingAddress: boolean

  @ApiProperty()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  account: mongoose.Schema.Types.ObjectId

  @ApiProperty()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  testTaker: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial)
  }
}
