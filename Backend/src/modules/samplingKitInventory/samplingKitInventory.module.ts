// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SamplingKitInventory,
  SamplingKitInventorySchema,
} from './schemas/samplingKitInventory.schema'
import { FacilityModule } from '../facility/facility.module'
import { AuthModule } from '../auth/auth.module'
import { SamplingKitInventoryController } from './samplingKitInventory.controller'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import { SamplingKitInventoryService } from './samplingKitInventory.service'
import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { SamplingKitInventoryRepository } from './samplingKitInventory.repository'
import { SampleModule } from '../sample/sample.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SamplingKitInventory.name, schema: SamplingKitInventorySchema },
    ]),
    FacilityModule,
    AuthModule,
    SampleModule,
  ],
  controllers: [SamplingKitInventoryController],
  providers: [
    {
      provide: ISamplingKitInventoryService,
      useClass: SamplingKitInventoryService,
    },
    {
      provide: ISamplingKitInventoryRepository,
      useClass: SamplingKitInventoryRepository,
    },
  ],
  exports: [
    MongooseModule,
    ISamplingKitInventoryService,
    ISamplingKitInventoryRepository,
  ],
})
export class SamplingKitInventoryModule {}
