import { AdminController } from './admin.controller'
import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { IAdminService } from './interfaces/iadmin.service'
import { IAdminRepository } from './interfaces/iadmin.repository'
import { AdminRepository } from './admin.repository'
import { Account, AccountSchema } from '../account/schemas/account.schema'
import { Facility, FacilitySchema } from '../facility/schemas/facility.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { RoleModule } from '../role/role.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Facility.name, schema: FacilitySchema },
    ]),
    AuthModule,
    RoleModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: IAdminService,
      useClass: AdminService,
    },
    {
      provide: IAdminRepository,
      useClass: AdminRepository,
    },
  ],
  exports: [IAdminService, IAdminRepository],
})
export class AdminModule {}
