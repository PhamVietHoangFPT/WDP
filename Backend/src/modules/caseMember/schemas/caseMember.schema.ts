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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'testTaker',
    required: true,
  })
  testTakerId: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceCase',
    required: true,
  })
  caseId: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'samplingKitInventory',
    required: true,
  })
  samplingKitInventoryId: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'kitShipment',
    required: true,
  })
  kitShipmentId: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'booking',
    required: true,
  })
  bookingId: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'service',
    required: true,
  })
  serviceId: mongoose.Schema.Types.ObjectId
}

export const CaseMemberSchema = SchemaFactory.createForClass(CaseMember)
