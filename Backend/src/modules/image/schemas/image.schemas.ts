import { KitShipment } from './../../KitShipment/schemas/kitShipment.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

export type ImageDocument = HydratedDocument<Image>

@Schema()
export class Image extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  url: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, trim: true })
  blog: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, trim: true })
  kitShipment?: mongoose.Schema.Types.ObjectId
}

export const ImageSchema = SchemaFactory.createForClass(Image)
