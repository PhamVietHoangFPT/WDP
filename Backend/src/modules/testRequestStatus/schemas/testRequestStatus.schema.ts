import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TestRequestStatusDocument = HydratedDocument<TestRequestStatus>

@Schema()
export class TestRequestStatus extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  testRequestStatus: string

  @Prop({ type: Number, required: true, trim: true })
  order: number
}

export const TestRequestStatusSchema =
  SchemaFactory.createForClass(TestRequestStatus)
