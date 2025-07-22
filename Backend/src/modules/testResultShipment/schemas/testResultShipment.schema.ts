import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TestResultShipmentDocument = HydratedDocument<TestResultShipment>
@Schema()
export class TestResultShipment extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({
    type: Date,
    nullable: true,
  })
  testResultDispatchedDate: Date

  @Prop({
    type: Date,
    nullable: true,
  })
  testResultDeliveryDate: Date
}

export const TestResultShipmentSchema =
  SchemaFactory.createForClass(TestResultShipment)
