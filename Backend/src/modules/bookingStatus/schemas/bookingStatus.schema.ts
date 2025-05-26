import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type bookingStatusDocument = HydratedDocument<bookingStatus>

export class bookingStatus extends BaseEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  bookingStatus: string
}

export const bookingStatusSchema = SchemaFactory.createForClass(bookingStatus)
