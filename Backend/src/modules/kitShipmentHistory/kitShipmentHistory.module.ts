import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  KitShipmentHistory,
  KitShipmentHistorySchema,
} from './schemas/KitShipmentHistory.schema'
import { KitShipment, KitShipmentSchema } from '../KitShipment/schemas/kitShipment.schema'
import { KitShipmentHistoryController } from './KitShipmentHistory.controller'
import { IKitShipmentHistoryService } from './interfaces/iKitShipmentHistory.service'
import { KitShipmentHistoryService } from './KitShipmentHistory.service'
import { IKitShipmentHistoryRepository } from './interfaces/iKitShipmentHistory.repository'
import { KitShipmentHistoryRepository } from './KitShipmentHistory.repository'
import { AuthModule } from '../auth/auth.module'
import { KitShipmentModule } from '../KitShipment/kitShipment.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitShipmentHistory.name, schema: KitShipmentHistorySchema },
      { name: KitShipment.name, schema: KitShipmentSchema },
    ]),
    AuthModule,
    forwardRef(() => KitShipmentModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [KitShipmentHistoryController],
  providers: [
    {
      provide: IKitShipmentHistoryRepository,
      useClass: KitShipmentHistoryRepository,
    },
    {
      provide: IKitShipmentHistoryService,
      useClass: KitShipmentHistoryService,
    },
  ],
  exports: [
    IKitShipmentHistoryRepository,
    IKitShipmentHistoryService,
    MongooseModule,
  ],
})
export class KitShipmentHistoryModule { }
