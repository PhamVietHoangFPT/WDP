import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ _id: false }) // Không sử dụng _id cho Ward
export class Ward extends Document {
  @Prop()
  Code: string

  @Prop()
  FullName: string

  @Prop({ type: String, required: true }) // <-- THAY ĐỔI Ở ĐÂY
  ProvinceCode: string // Liên kết trực tiếp với Tỉnh
}

@Schema()
export class Locations extends Document {
  @Prop()
  Code: string

  @Prop()
  FullName: string

  @Prop({ type: [Ward], default: [] })
  Wards: Ward[]
}

export const LocationsSchema = SchemaFactory.createForClass(Locations)
