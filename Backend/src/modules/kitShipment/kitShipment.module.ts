// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { KitShipment, KitShipmentSchema } from './schemas/kitShipment.schema'
import { FacilityModule } from '../facility/facility.module'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitShipment.name, schema: KitShipmentSchema },
    ]),
    FacilityModule,
    AccountModule,
  ],

  exports: [MongooseModule],
})
export class KitShipmentModule {}
