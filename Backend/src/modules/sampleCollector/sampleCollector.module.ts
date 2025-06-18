import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'
import { TestRequestHistoryModule } from '../testRequestHistory/testRequestHistory.module'
import { CaseMemberModule } from '../caseMember/caseMember.module'
import { AuthModule } from '../auth/auth.module'
import { SampleCollectorController } from './sampleCollector.controller'
import { SampleCollectorService } from './sampleCollector.service'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import {
  CaseMember,
  CaseMemberSchema,
} from '../caseMember/schemas/caseMember.schema'
import { Booking, BookingSchema } from '../booking/schemas/booking.schema'
import { RoleModule } from '../role/role.module'
import { Account, AccountSchema } from '../account/schemas/account.schema'
import { Facility, FacilitySchema } from '../facility/schemas/facility.schema'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      { name: CaseMember.name, schema: CaseMemberSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Facility.name, schema: FacilitySchema },
      { name: TestRequestStatus.name, schema: TestRequestStatusSchema },
    ]),
    ServiceCaseModule,
    TestRequestHistoryModule,
    CaseMemberModule,
    AuthModule,
    RoleModule,
  ],
  controllers: [SampleCollectorController],
  providers: [SampleCollectorService],
})
export class SampleCollectorModule {}
