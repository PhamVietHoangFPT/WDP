// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Facility, FacilitySchema } from './schemas/facility.schema'
import { AddressModule } from '../address/address.module'
import { AccountModule } from '../account/account.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Facility.name, schema: FacilitySchema },
    ]),
    AddressModule,
    AccountModule,
  ],

  exports: [MongooseModule],
})
export class FacilityModule {}
