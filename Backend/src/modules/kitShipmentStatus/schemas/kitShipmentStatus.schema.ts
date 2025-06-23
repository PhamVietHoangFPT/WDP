import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type KitShipmentStatusDocument = HydratedDocument<KitShipmentStatus>

@Schema()
export class KitShipmentStatus extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({ type: String, required: true })
    status: string

    @Prop({ type: Number }) 
    order: number
}

export const KitShipmentStatusSchema = SchemaFactory.createForClass(KitShipmentStatus)
