import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type SampleTypeDocument = HydratedDocument<SampleType>

@Schema()
export class SampleType extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: Number, required: true })
  sampleTypeFee: number
}

export const SampleTypeSchema = SchemaFactory.createForClass(SampleType)
