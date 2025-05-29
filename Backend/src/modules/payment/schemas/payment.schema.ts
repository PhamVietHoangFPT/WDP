import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { responseCodeEnum } from 'src/common/enums/responseCode.enum'
import { transactionStatusEnum } from 'src/common/enums/transactionStatus.enum'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type PaymentDocument = HydratedDocument<Payment>

@Schema()
export class Payment extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, trim: true })
  tmnCode: string

  @Prop({ type: Number, required: true, trim: true })
  amount: number

  @Prop({ type: String, required: true, trim: true })
  transactionStatus: transactionStatusEnum

  @Prop({ type: String, required: true, trim: true })
  responseCode: responseCodeEnum

  @Prop({ type: Date, default: Date.now })
  payDate: Date

  @Prop({ type: String, required: true, trim: true })
  transactionReferenceNumber: string

  @Prop({ type: String, required: true, trim: true })
  orderInfo: string

  @Prop({ type: String, required: true, trim: true })
  transactionNo: string

  @Prop({ type: Boolean, default: false })
  isForBooking: boolean
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
