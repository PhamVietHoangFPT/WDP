import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TypeDocument = HydratedDocument<Type>
@Schema()
export class Type extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId
    @Prop({ type: String, required: true })
    name: string

    @Prop({ type: Number, required: true, min: 1 })
    typeFee: number

    @Prop({ type: Boolean, required: true })
    isSpecial: boolean

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Condition', required: true })
    conditionId: mongoose.Schema.Types.ObjectId

    @Prop({ type: String })
    description: string
}

export const TypeDocument = SchemaFactory.createForClass(Type)
