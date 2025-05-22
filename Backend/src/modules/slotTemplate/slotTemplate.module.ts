// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SlotTemplate, SlotTemplateSchema } from './schemas/slotTemplate.schema'
import { SlotTemplateController } from './slotTemplate.controller'
import { SlotTemplateRepository } from './slotTemplate.repository'
import { SlotTemplateService } from './slotTemplate.service'
import { ISlotTemplateService } from './interfaces/islotTemplate.service'
import { ISlotTemplateRepository } from './interfaces/islotTemplate.repository'
import { FacilityModule } from '../facility/facility.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SlotTemplate.name, schema: SlotTemplateSchema },
    ]),
    FacilityModule,
  ],
  controllers: [SlotTemplateController],

  providers: [
    {
      provide: ISlotTemplateRepository,
      useClass: SlotTemplateRepository,
    },
    {
      provide: ISlotTemplateService,
      useClass: SlotTemplateService,
    },
  ],

  exports: [ISlotTemplateService],
})
export class SlotTemplateModule {}
