import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ResultDocument = HydratedDocument<Result>
@Schema()
export class Result extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: Number, required: true, trim: true })
  adnPercentage: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  doctorId: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  conclusion: string
}
export const ResultSchema = SchemaFactory.createForClass(Result)
