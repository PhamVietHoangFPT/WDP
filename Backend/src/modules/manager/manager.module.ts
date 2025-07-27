import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ManagerService } from './manager.service'
import { ManagerRepository } from './manager.repository'
import { IManagerService } from './interfaces/imanager.service'
import { IManagerRepository } from './interfaces/imanager.repository'
import { ManagerController } from './manager.controller'
import { Account, AccountSchema } from '../account/schemas/account.schema'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import { AuthModule } from '../auth/auth.module'
import { RoleModule } from '../role/role.module'
import { Address, AddressSchema } from '../address/schemas/address.schema'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import { Role, RoleSchema } from '../role/schemas/role.schema'
import {
  KitShipment,
  KitShipmentSchema,
} from '../KitShipment/schemas/kitShipment.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      { name: KitShipment.name, schema: KitShipmentSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    AuthModule,
    RoleModule,
    TestRequestStatusModule,
  ],
  controllers: [ManagerController],
  providers: [
    {
      provide: IManagerRepository,
      useClass: ManagerRepository,
    },
    {
      provide: IManagerService,
      useClass: ManagerService,
    },
  ],
  exports: [IManagerService, IManagerRepository, MongooseModule],
})
export class ManagerModule {}
