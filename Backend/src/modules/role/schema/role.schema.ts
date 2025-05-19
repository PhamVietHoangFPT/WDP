import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongoose from 'mongoose'
import { BaseEntity } from 'src/common/schema/base_entity.schema'

export type RoleDocument = HydratedDocument<Role>

export class Role extends BaseEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, trim: true })
  role: string
}

export const RoleSchema = SchemaFactory.createForClass(Role)
