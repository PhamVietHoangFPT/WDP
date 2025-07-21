import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TestResultShipmentHistoryDocument = HydratedDocument<TestResultShipmentHistory>

@Schema()
export class TestResultShipmentHistory extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShipmentStatus',
        required: true,
    })
    shipmentStatus: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestResultShipment',
        required: true,
    })
    testResultShipment: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    })
    account: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    })
    shipper: mongoose.Schema.Types.ObjectId
}

export const TestResultShipmentHistorySchema =
    SchemaFactory.createForClass(TestResultShipmentHistory)
