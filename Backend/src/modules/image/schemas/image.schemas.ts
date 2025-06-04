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

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRequestStatus',
    default: null,
  })
  testRequestHistoryTestRequestStatus: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRequest',
    default: null,
  })
  testRequestHistoryTestRequest: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KitShipment',
    default: null,
  })
  kitShipment: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShipmentStatus',
    default: null,
  })
  testRequestShipmentHistoryShipmentStatus: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestRequestShipment',
    default: null,
  })
  testRequestShipmentHistoryTestRequestShipment: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Blog', default: null })
  blog: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdministrationDocument',
    default: null,
  })
  administrationDocument: mongoose.Schema.Types.ObjectId
}

export const ImageSchema = SchemaFactory.createForClass(Image)
