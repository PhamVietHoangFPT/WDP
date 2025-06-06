import { ISampleRepository } from './interfaces/isample.repository'
import { ISampleService } from './interfaces/isample.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Sample, SampleSchema } from './schemas/sample.schema'
import { ConditionModule } from '../condition/condition.module'
import { AuthModule } from '../auth/auth.module'
import { SampleController } from './sample.controller'
import { SampleService } from './sample.service'
import { SampleRepository } from './sample.repository'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sample.name, schema: SampleSchema }]),
    AuthModule,
    ConditionModule,
    AccountModule,
  ],
  controllers: [SampleController],
  providers: [
    {
      provide: ISampleService,
      useClass: SampleService,
    },
    {
      provide: ISampleRepository,
      useClass: SampleRepository,
    },
  ],
  exports: [ISampleService, ISampleRepository],
})
export class SampleModule {}
