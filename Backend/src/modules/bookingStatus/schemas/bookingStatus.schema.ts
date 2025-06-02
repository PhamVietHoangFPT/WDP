import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type BookingStatusDocument = HydratedDocument<BookingStatus>
@Schema()
export class BookingStatus extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, unique: true })
  bookingStatus: string
}

export const BookingStatusSchema = SchemaFactory.createForClass(BookingStatus)
