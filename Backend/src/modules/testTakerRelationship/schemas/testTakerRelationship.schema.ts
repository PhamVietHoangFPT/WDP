import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TestTakerRelationshipDocument =
  HydratedDocument<TestTakerRelationship>

@Schema()
export class TestTakerRelationship extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  testTakerRelationship: string

  @Prop({ type: Number, required: true, trim: true })
  generation: number

  @Prop({ type: Boolean, default: null })
  isAgnate: boolean
}

export const TestTakerRelationshipSchema = SchemaFactory.createForClass(
  TestTakerRelationship,
)
