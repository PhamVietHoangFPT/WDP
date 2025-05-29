// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Address, AddressSchema } from './schemas/address.schema'
import { AccountModule } from '../account/account.module'
import { TestTakerModule } from '../testTaker/testTaker.module'
import { IAddressService } from './interfaces/iaddress.service'
import { AddressService } from './address.service'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { AddressRepository } from './address.repository'
import { AddressController } from './address.controller'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    AccountModule,
    TestTakerModule,
  ],
  controllers: [AddressController],
  providers: [
    { provide: IAddressService, useClass: AddressService },
    { provide: IAddressRepository, useClass: AddressRepository },
  ],

  exports: [IAddressService, IAddressRepository],
})
export class AddressModule {}
