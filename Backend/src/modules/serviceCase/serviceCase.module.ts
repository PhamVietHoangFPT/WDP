// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ServiceCase, ServiceCaseSchema } from './schemas/serviceCase.schema'
import { ServiceCaseController } from './serviceCase.controller'
import { IServiceCaseService } from './interfaces/iserviceCase.service'
import { ServiceCaseService } from './serviceCase.service'
import { IServiceCaseRepository } from './interfaces/iserviceCase.repository'
import { ServiceCaseRepository } from './serviceCase.repository'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import { ServiceModule } from '../service/service.module'
import { CaseMemberModule } from '../caseMember/caseMember.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
    ]),
    TestRequestStatusModule,
    ServiceModule,
    CaseMemberModule,
    AuthModule,
  ],
  controllers: [ServiceCaseController],
  providers: [
    {
      provide: IServiceCaseService,
      useClass: ServiceCaseService,
    },
    {
      provide: IServiceCaseRepository,
      useClass: ServiceCaseRepository,
    },
  ],
  exports: [MongooseModule, IServiceCaseService, IServiceCaseRepository],
})
export class ServiceCaseModule {}
