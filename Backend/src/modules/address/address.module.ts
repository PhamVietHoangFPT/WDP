import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HttpModule } from '@nestjs/axios' // <-- 1. Import HttpModule

import { Address, AddressSchema } from './schemas/address.schema'
import { AddressController } from './address.controller'
import { AddressService } from './address.service'
import { AddressRepository } from './address.repository'
import { AuthModule } from '../auth/auth.module'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { IAddressService } from './interfaces/iaddress.service'

@Module({
  imports: [
    HttpModule, // <-- 2. Thêm HttpModule vào imports
    AuthModule,
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  controllers: [AddressController],
  providers: [
    {
      provide: IAddressRepository,
      useClass: AddressRepository,
    },
    {
      provide: IAddressService,
      useClass: AddressService,
    },
    // <-- 3. XÓA BỎ TOÀN BỘ PROVIDER CHO 'GOOGLE_MAPS_CLIENT' -->
  ],
})
export class AddressModule {}
