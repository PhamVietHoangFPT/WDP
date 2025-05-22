import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type FacilityDocument = HydratedDocument<Facility>

@Schema()
export class Facility extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  facilityName: string

  @Prop({ type: String, default: null, unique: true })
  phoneNumber: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address' })
  addressId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  managerId: mongoose.Schema.Types.ObjectId
}

export const FacilitySchema = SchemaFactory.createForClass(Facility)
