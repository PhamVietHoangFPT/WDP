import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type AddressDocument = HydratedDocument<Address>
@Schema({ _id: false })
export class Point {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string

  @Prop({ type: [Number], required: true })
  coordinates: number[] // [longitude, latitude] - LƯU Ý THỨ TỰ!
}

@Schema()
export class Address extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  fullAddress: string

  @Prop({ type: Point, index: '2dsphere' }) // <-- Thêm chỉ mục 2dsphere
  location: Point

  @Prop({ type: Boolean, trim: true })
  isKitShippingAddress: boolean

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  account: mongoose.Schema.Types.ObjectId
}

export const AddressSchema = SchemaFactory.createForClass(Address)
