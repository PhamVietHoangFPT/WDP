// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from './schemas/testRequestStatus.schema'
import { TestRequestStatusRepository } from './testRequestStatus.repository'
import { ITestRequestStatusRepository } from './interfaces/itestRequestStatus.repository'
import { TestRequestStatusService } from './testRequestStatus.service'
import { ITestRequestStatusService } from './interfaces/itestRequestStatus.service'
import { TestRequestStatusController } from './testRequestStatus.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestRequestStatus.name, schema: TestRequestStatusSchema },
    ]),
  ],
  controllers: [TestRequestStatusController],
  providers: [
    {
      provide: ITestRequestStatusRepository,
      useClass: TestRequestStatusRepository,
    },
    {
      provide: ITestRequestStatusService,
      useClass: TestRequestStatusService,
    },
  ],
  exports: [
    MongooseModule,
    ITestRequestStatusRepository,
    ITestRequestStatusService,
  ],
})
export class TestRequestStatusModule {}
