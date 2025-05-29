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
  tmnCode: string

  @Expose()
  @ApiProperty({ example: 100000 })
  amount: number

  @Expose()
  @ApiProperty({ example: 'Thành công' })
  transactionStatus: string

  @Expose()
  @ApiProperty({ example: 'Thành công' })
  responseCode: string

  @Expose()
  @ApiProperty({ example: new Date() })
  payDate: Date

  @Expose()
  @ApiProperty({ example: '1234567890' })
  transactionReferenceNumber: string

  @Expose()
  @ApiProperty({ example: 'Thanh toan don hang #DH12345' })
  orderInfo: string

  @Expose()
  @ApiProperty({ example: 'transactionNo' })
  transactionNo: string

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial)
  }
}
