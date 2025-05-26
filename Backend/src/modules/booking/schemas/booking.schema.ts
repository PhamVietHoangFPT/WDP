import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type BookingDocument = HydratedDocument<Booking>

@Schema()
export class Booking extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Date, required: true })
  bookingDate: Date

  @Prop({ type: String, required: true }) // e.g., "09:00"
  note: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Slot' })
  slot: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  })
  account: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' })
  payment: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BookingStatus' })
  bookingStatus: mongoose.Schema.Types.ObjectId
}

export const BookingSchema = SchemaFactory.createForClass(Booking)
