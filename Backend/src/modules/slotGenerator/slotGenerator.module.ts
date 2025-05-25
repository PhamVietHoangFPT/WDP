import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SlotGenerationService } from './slotGenerator.service'
import { SlotModule } from '../slot/slot.module'
import {
  SlotTemplate,
  SlotTemplateSchema,
} from '../slotTemplate/schemas/slotTemplate.schema'
import { Slot, SlotSchema } from '../slot/schemas/slot.schema'
import { SlotGenerationController } from './slotGenerator.controller'
import { AuthModule } from '../auth/auth.module'
import { SlotTemplateModule } from '../slotTemplate/slotTemplate.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SlotTemplate.name, schema: SlotTemplateSchema },
      { name: Slot.name, schema: SlotSchema }, // Cần SlotModel để count và insertMany
    ]),
    SlotModule, // Để SlotGenerationService có thể inject ISlotService (đã được export từ SlotModule)
    AuthModule,
    SlotTemplateModule,
  ],
  controllers: [SlotGenerationController], // Không cần controller nếu chỉ có service
  providers: [SlotGenerationService],
})
export class SlotGenerationModule {}
