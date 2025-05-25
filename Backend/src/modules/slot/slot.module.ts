// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Slot, SlotSchema } from './schemas/slot.schema'
import { SlotTemplateModule } from '../slotTemplate/slotTemplate.module'
import { ISlotRepository } from './interfaces/islot.repository'
import { ISlotService } from './interfaces/islot.service'
import { SlotRepository } from './slot.repository'
import { SlotService } from './slot.service'
import { SlotController } from './slot.controller'
import { AuthModule } from '../auth/auth.module'
import { FacilityModule } from '../facility/facility.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
    SlotTemplateModule,
    AuthModule,
    FacilityModule,
  ],
  controllers: [SlotController],

  providers: [
    {
      provide: ISlotRepository,
      useClass: SlotRepository,
    },
    {
      provide: ISlotService,
      useClass: SlotService,
    },
  ],
  exports: [ISlotService, ISlotRepository],
})
export class SlotModule {}
