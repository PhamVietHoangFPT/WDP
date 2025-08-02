import { ICertifierRepository } from './interfaces/icertifier.repository'
import { Module } from '@nestjs/common'
import { ICertifierService } from './interfaces/icertifier.service'
import { CertifierController } from './certifier.controller'
import { CertifierRepository } from './certifier.repository'
import { CertifierService } from './certifier.service'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'

import { MongooseModule } from '@nestjs/mongoose'
import {
  ServiceCase,
  ServiceCaseSchema,
} from 'src/modules/serviceCase/schemas/serviceCase.schema'
import { AdnDocumentationModule } from '../adnDocumentation/adnDocumentation.module'
import { AuthModule } from '../auth/auth.module'
import { ResultModule } from '../result/result.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      { name: TestRequestStatus.name, schema: TestRequestStatusSchema },
    ]),
    AdnDocumentationModule,
    AuthModule,
    ResultModule,
  ],
  controllers: [CertifierController],
  providers: [
    {
      provide: ICertifierRepository,
      useClass: CertifierRepository,
    },
    {
      provide: ICertifierService,
      useClass: CertifierService,
    },
  ],
  exports: [ICertifierService, ICertifierRepository],
})
export class CertifierModule {}
