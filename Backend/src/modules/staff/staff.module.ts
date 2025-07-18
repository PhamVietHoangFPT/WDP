import { Module } from '@nestjs/common'
import { StaffController } from './staff.controller'
import { StaffService } from './staff.service'
import { IStaffService } from './interfaces/istaff.service'
import { IStaffRepository } from './interfaces/istaff.repository'
import { StaffRepository } from './staff.repository'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
    ]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: IStaffService,
      useClass: StaffService,
    },
    {
      provide: IStaffRepository,
      useClass: StaffRepository,
    },
  ],
  exports: [IStaffService, IStaffRepository],
})
export class StaffModule {}
