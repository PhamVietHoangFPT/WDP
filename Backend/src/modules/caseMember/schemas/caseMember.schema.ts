import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type CaseMemberDocument = HydratedDocument<CaseMember>
@Schema()
export class CaseMember extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestTaker' }],
    required: true,
    default: [],
  })
  testTaker: mongoose.Schema.Types.ObjectId[]

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SamplingKitInventory',
  })
  samplingKitInventory: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  })
  booking: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  })
  service: mongoose.Schema.Types.ObjectId

  @Prop({
    type: String,
    trim: true,
  })
  note: string

  @Prop({ type: Boolean, required: true })
  isAtHome: boolean
}

export const CaseMemberSchema = SchemaFactory.createForClass(CaseMember)
