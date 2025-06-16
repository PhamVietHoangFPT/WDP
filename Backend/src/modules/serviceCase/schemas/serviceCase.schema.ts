import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ServiceCaseDocument = HydratedDocument<ServiceCase>

@Schema()
export class ServiceCase extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({
    type: Number,
  })
  totalFee: number

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseMember',
  })
  caseMember: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  })
  staff: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  })
  account: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRequestStatus',
  })
  currentStatus: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  })
  payment: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result',
  })
  result: mongoose.Schema.Types.ObjectId
}

export const ServiceCaseSchema = SchemaFactory.createForClass(ServiceCase)
