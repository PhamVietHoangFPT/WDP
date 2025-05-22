// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Address, AddressSchema } from './schemas/address.schema'
import { AccountModule } from '../account/account.module'
import { TestTakerModule } from '../testTaker/testTaker.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    AccountModule,
    TestTakerModule,
  ],

  exports: [MongooseModule],
})
export class AddressModule {}
