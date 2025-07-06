import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SampleCollectorController } from './sampleCollector.controller'
import { SampleCollectorService } from './sampleCollector.service'
import { SampleCollectorRepository } from './sampleCollector.repository'
import { ISampleCollectorService } from './interfaces/isampleCollector.service'
import { ISampleCollectorRepository } from './interfaces/isampleCollector.repository'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      { name: TestRequestStatus.name, schema: TestRequestStatusSchema },
    ]),
    AuthModule,
  ],
  controllers: [SampleCollectorController],
  providers: [
    {
      provide: ISampleCollectorService,
      useClass: SampleCollectorService,
    },
    {
      provide: ISampleCollectorRepository,
      useClass: SampleCollectorRepository,
    },
  ],
  exports: [ISampleCollectorService, ISampleCollectorRepository],
})
export class SampleCollectorModule {}
