import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type RelationshipDocument = HydratedDocument<Relationship>
@Schema()
export class Relationship extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({ type: String, required: true })
    name: string

    @Prop({ type: Number, required: true, min: 1 })
    relationshipFee: number

    @Prop({ type: String })
    description: string

    @Prop({ type: Number, required: true, min: 1 })
    relationshipGap: number
}

export const RelationshipDocument = SchemaFactory.createForClass(Relationship)
