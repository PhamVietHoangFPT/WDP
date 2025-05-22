// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SamplingKitInventory,
  SamplingKitInventorySchema,
} from './schemas/samplingKitInventory.schema'
import { FacilityModule } from '../facility/facility.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SamplingKitInventory.name, schema: SamplingKitInventorySchema },
    ]),
    FacilityModule,
  ],

  exports: [MongooseModule],
})
export class SamplingKitInventoryModule {}
