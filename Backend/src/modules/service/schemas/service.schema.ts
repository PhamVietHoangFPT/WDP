import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ServiceDocument = HydratedDocument<Service>
@Schema()
export class Service extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({ type: Number, required: true, min: 1 })
    fee: number

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Relationship', required: true })
    relationshipId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TimeReturn', required: true })
    timeReturnId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true })
    typeId: mongoose.Schema.Types.ObjectId
}

export const ServiceDocument = SchemaFactory.createForClass(Service)
