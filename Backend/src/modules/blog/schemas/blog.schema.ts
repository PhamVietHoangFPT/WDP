import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type BlogDocument = HydratedDocument<Blog>
@Schema()
export class Blog extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true })
  title: string

  @Prop({ type: String, required: true })
  content: string

  @Prop({ type: String, required: true })
  description: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Service',
  })
  service: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Account',
  })
  account: mongoose.Schema.Types.ObjectId
}

export const BlogSchema = SchemaFactory.createForClass(Blog)
