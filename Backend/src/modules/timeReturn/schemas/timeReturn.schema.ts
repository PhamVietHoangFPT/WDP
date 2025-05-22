import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type TimeReturnDocument = HydratedDocument<TimeReturn>
@Schema()
export class TimeReturn extends BaseEntity {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    })
    _id: mongoose.Schema.Types.ObjectId

    @Prop({ type: Number, required: true })
    timeReturn: number

    @Prop({ type: Number, required: true })
    timeReturnFee: number

    @Prop({ type: String })
    description: string

}

export const TimeReturnSchema = SchemaFactory.createForClass(TimeReturn)
