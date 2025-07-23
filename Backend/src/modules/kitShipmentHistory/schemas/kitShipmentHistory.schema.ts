import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type KitShipmentHistoryDocument = HydratedDocument<KitShipmentHistory>

@Schema()
export class KitShipmentHistory extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KitShipmentStatus',
        required: true,
    })
    kitShipmentStatus: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KitShipment',
        required: true,
    })
    kitShipment: mongoose.Schema.Types.ObjectId

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    })
    customer: mongoose.Schema.Types.ObjectId
}

export const KitShipmentHistorySchema =
    SchemaFactory.createForClass(KitShipmentHistory)
