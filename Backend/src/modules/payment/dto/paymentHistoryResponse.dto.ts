/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import { Payment } from '../schemas/payment.schema'
import mongoose from 'mongoose'

@Exclude()
export class PaymentHistoryResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'transactionId' })
  transactionId: string

  @Expose()
  @ApiProperty({ example: 100000 })
  amount: number

  @Expose()
  @ApiProperty({ example: 'Thành công' })
  paymentStatus: string

  @Expose()
  payDate: Date

  @Expose()
  @ApiProperty({ example: 'Thanh toan don hang #DH12345' })
  description: string

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial)
  }
}
