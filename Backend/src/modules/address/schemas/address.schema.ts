import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type AddressDocument = HydratedDocument<Address>

@Schema()
export class Address extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  fullAddress: string

  @Prop({ type: Boolean, trim: true })
  isKitShippingAddress: boolean

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TestTaker' })
  testTaker: mongoose.Schema.Types.ObjectId
}

export const AddressSchema = SchemaFactory.createForClass(Address)
