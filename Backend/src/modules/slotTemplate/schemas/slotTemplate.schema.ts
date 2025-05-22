import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type SlotTemplateDocument = HydratedDocument<SlotTemplate>

@Schema()
export class SlotTemplate extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  daysOfWeek: string

  @Prop({ type: String, required: true, trim: true })
  workTimeStart: string

  @Prop({ type: String, default: null, unique: true })
  workTimeEnd: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' })
  facility: mongoose.Schema.Types.ObjectId

  @Prop({ type: Boolean, default: true })
  isActive: boolean
}

export const SlotTemplateSchema = SchemaFactory.createForClass(SlotTemplate)
