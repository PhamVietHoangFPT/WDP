import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type SlotDocument = HydratedDocument<Slot>

@Schema()
export class Slot extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Date, required: true })
  slotDate: Date

  @Prop({ type: String, required: true }) // e.g., "09:00"
  startTime: string

  @Prop({ type: String, required: true }) // e.g., "10:30"
  endTime: string

  @Prop({ type: Boolean, default: false }) // Trạng thái đã được đặt hay chưa
  isBooked: boolean

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SlotTemplate' })
  slotTemplate: mongoose.Schema.Types.ObjectId
}

export const SlotSchema = SchemaFactory.createForClass(Slot)
