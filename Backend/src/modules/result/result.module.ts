import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Result, ResultSchema } from './schemas/result.schema'
import { ResultController } from './result.controller'
import { IResultService } from './interfaces/iresult.service'
import { ResultService } from './result.service'
import { IResultRepository } from './interfaces/iresult.repository'
import { ResultRepository } from './result.repository'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'
import { AuthModule } from '../auth/auth.module'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    ServiceCaseModule,
    AuthModule,
    TestRequestStatusModule,
    EmailModule,
  ],
  controllers: [ResultController],
  providers: [
    {
      provide: IResultService,
      useClass: ResultService,
    },
    {
      provide: IResultRepository,
      useClass: ResultRepository,
    },
  ],
})
export class ResultModule {}
