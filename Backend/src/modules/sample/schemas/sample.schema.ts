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

  @Prop({ type: Number, required: true })
  fee: number
}

export const SampleSchema = SchemaFactory.createForClass(Sample)
