// src/database/base.entity.ts (hoặc một đường dẫn tương tự)
import { Prop } from '@nestjs/mongoose'
import mongoose from 'mongoose'

export abstract class BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false,
    index: true,
    default: null,
  })
  created_by: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false,
    index: true,
    default: null,
  })
  updated_by: mongoose.Schema.Types.ObjectId

  @Prop({ type: Date, default: Date.now })
  created_at: Date

  @Prop({ type: Date, default: null })
  updated_at: Date

  @Prop({ type: Date, default: null })
  deleted_at: Date

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null,
    required: false,
    index: true,
  })
  deleted_by: mongoose.Schema.Types.ObjectId
}
