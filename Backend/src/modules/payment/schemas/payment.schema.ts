import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { paymentStatusEnum } from 'src/common/enums/paymentStatus.enum'
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
  transactionId: string

  @Prop({ type: Number, required: true, trim: true })
  amount: number

  @Prop({ type: String, required: true, trim: true })
  paymentStatus: paymentStatusEnum

  @Prop({ type: Date, default: Date.now })
  payDate: Date

  @Prop({ type: String, required: true, trim: true })
  description: string
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
