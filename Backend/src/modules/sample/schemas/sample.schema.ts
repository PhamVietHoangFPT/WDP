import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type SampleDocument = HydratedDocument<Sample>
@Schema()
export class Sample extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, unique: true })
  name: string

  @Prop({ type: Boolean, required: true })
  isSpecial: boolean

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Condition',
    required: true,
  })
  condition: mongoose.Schema.Types.ObjectId

  @Prop({ type: String })
  description: string

  @Prop({ type: Boolean, default: true })
  isAdminstration: boolean
}

export const SampleSchema = SchemaFactory.createForClass(Sample)
