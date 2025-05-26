// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Facility, FacilitySchema } from './schemas/facility.schema'
import { AddressModule } from '../address/address.module'
import { AccountModule } from '../account/account.module'
import { FacilityController } from './facility.controller'
import { FacilityService } from './facility.service'
import { IFacilityService } from './interfaces/ifacility.service'
import { IFacilityRepository } from './interfaces/ifacility.repository'
import { FacilityRepository } from './facility.repository'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Facility.name, schema: FacilitySchema },
    ]),
    AddressModule,
    AccountModule,
    AuthModule,
  ],

  controllers: [FacilityController],
  providers: [
    {
      provide: IFacilityService,
      useClass: FacilityService,
    },
    {
      provide: IFacilityRepository,
      useClass: FacilityRepository,
    },
  ],

  exports: [MongooseModule],
})
export class FacilityModule {}
