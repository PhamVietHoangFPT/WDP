import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TestTakerDocument = HydratedDocument<TestTaker>

@Schema()
export class TestTaker extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  name: string

  @Prop({ type: String, required: true, trim: true })
  personalId: string

  @Prop({ type: String, default: null, unique: true })
  phoneNumber: string

  @Prop({ type: Boolean, default: null })
  gender: boolean

  @Prop({ type: Date, default: null })
  dateOfBirth: Date

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'account' })
  accountId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'testTakerRelationShip' })
  testTakerRelationShipId: mongoose.Schema.Types.ObjectId
}

export const TestTakerSchema = SchemaFactory.createForClass(TestTaker)
