import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type KitShipmentDocument = HydratedDocument<KitShipment>

@Schema()
export class KitShipment extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Date })
  kitDispatchedDate: Date

  @Prop({ type: Date })
  kitDeliveredToCustomerDate: Date

  @Prop({ type: Date })
  sampleReturnDispatchDate: Date

  @Prop({ type: Date })
  sampleReceivedAtLabDate: Date

  @Prop({ type: Boolean, required: true })
  selfCollectionConsent: boolean

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' })
  facility: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SamplingKitInventory' })
  samplingKitInventory: mongoose.Schema.Types.ObjectId
}

export const KitShipmentSchema = SchemaFactory.createForClass(KitShipment)
