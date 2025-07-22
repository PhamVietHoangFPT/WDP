import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Result, ResultSchema } from '../result/schemas/result.schema'
import { AuthModule } from '../auth/auth.module'
import { DoctorController } from './doctor.controller'
import { ResultModule } from '../result/result.module'
import { IDoctorRepository } from './interfaces/idoctor.repository'
import { DoctorRepository } from './doctor.repository'
import { IDoctorService } from './interfaces/idoctor.service'
import { DoctorService } from './doctor.service'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      {
        name: ServiceCase.name,
        schema: ServiceCaseSchema,
      },
      {
        name: TestRequestStatus.name,
        schema: TestRequestStatusSchema,
      },
    ]),
    AuthModule,
    ResultModule,
    TestRequestStatusModule,
    ServiceCaseModule,
  ],
  controllers: [DoctorController],
  providers: [
    {
      provide: IDoctorRepository,
      useClass: DoctorRepository,
    },
    {
      provide: IDoctorService,
      useClass: DoctorService,
    },
  ],
  exports: [IDoctorService, IDoctorRepository],
})
export class DoctorModule {}
