import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ShipmentStatusDocument = HydratedDocument<ShipmentStatus>
@Schema()
export class ShipmentStatus extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Boolean, required: true })
  shipmentStatus: boolean
}
export const ShipmentStatusSchema = SchemaFactory.createForClass(ShipmentStatus)
