import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ConditionDocument = HydratedDocument<Condition>
@Schema()
export class Condition extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Number, required: true, min: 0 })
  conditionFee: number

  @Prop({
    type: String,
    required: true,
  })
  condition: string
}
export const ConditionSchema = SchemaFactory.createForClass(Condition)
