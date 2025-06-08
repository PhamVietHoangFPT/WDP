import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SampleTypeController } from './sampleType.controller'
import { SampleTypeService } from './sampleType.service'
import { SampleTypeRepository } from './sampleType.repository'
import { SampleType, SampleTypeSchema } from './schemas/sampleType.schema'
import { ISampleTypeService } from './interfaces/isampleType.service'
import { ISampleTypeRepository } from './interfaces/isampleType.repository'
import { RoleModule } from '../role/role.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SampleType.name, schema: SampleTypeSchema },
    ]),
    RoleModule,
    AuthModule,
  ],
  controllers: [SampleTypeController],
  providers: [
    {
      provide: ISampleTypeService,
      useClass: SampleTypeService,
    },
    {
      provide: ISampleTypeRepository,
      useClass: SampleTypeRepository,
    },
  ],
  exports: [ISampleTypeRepository, ISampleTypeService, MongooseModule],
})
export class SampleTypeModule {}
