import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/base_entity.schema'

export type AccountDocument = HydratedDocument<Account>
@Schema()
export class Account extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  name: string

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string

  @Prop({ type: String, required: true, select: false })
  password: string

  @Prop({ type: Number, default: 0 })
  point: number

  @Prop({ type: String, default: null, unique: true })
  phone_number: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  role: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' })
  facility?: mongoose.Schema.Types.ObjectId

  @Prop({ type: Boolean, default: true })
  is_active: boolean
}

export const AccountSchema = SchemaFactory.createForClass(Account)
