import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type SamplingKitInventoryDocument =
  HydratedDocument<SamplingKitInventory>

@Schema()
export class SamplingKitInventory extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  lotNumber: string

  @Prop({ type: Date, default: null, unique: true })
  importDate: Date

  @Prop({ type: Date, required: true, trim: true })
  expDate: Date

  @Prop({ type: Number, default: null })
  amount: number

  @Prop({ type: Number, default: null })
  inventory: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' })
  facility: mongoose.Schema.Types.ObjectId
}

export const SamplingKitInventorySchema =
  SchemaFactory.createForClass(SamplingKitInventory)
