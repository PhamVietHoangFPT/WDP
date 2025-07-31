import { IAdnDocumentationRepository } from './interfaces/iadnDocumentation.repository'
import { AdnDocumentationRepository } from './adnDocumentation.repository'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  AdnDocumentation,
  AdnDocumentationSchema,
} from './schemas/adnDocumentation.schema'
import { AdnDocumentationService } from './adnDocumentation.service'
import { IAdnDocumentationService } from './interfaces/iadnDocumentation.service'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdnDocumentation.name, schema: AdnDocumentationSchema },
    ]),
    ServiceCaseModule,
  ],
  providers: [
    {
      provide: IAdnDocumentationRepository,
      useClass: AdnDocumentationRepository,
    },
    {
      provide: IAdnDocumentationService,
      useClass: AdnDocumentationService,
    },
  ],
  exports: [IAdnDocumentationService, IAdnDocumentationRepository],
})
export class AdnDocumentationModule {}
