// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SlotTemplate, SlotTemplateSchema } from './schemas/slotTemplate.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SlotTemplate.name, schema: SlotTemplateSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class AddressModule {}
