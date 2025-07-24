import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  KitShipmentHistory,
  KitShipmentHistorySchema,
} from './schemas/KitShipmentHistory.schema'
import { KitShipmentHistoryController } from './KitShipmentHistory.controller'
import { IKitShipmentHistoryService } from './interfaces/iKitShipmentHistory.service'
import { KitShipmentHistoryService } from './KitShipmentHistory.service'
import { IKitShipmentHistoryRepository } from './interfaces/iKitShipmentHistory.repository'
import { KitShipmentHistoryRepository } from './KitShipmentHistory.repository'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitShipmentHistory.name, schema: KitShipmentHistorySchema },
    ]),
    AuthModule,
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
export class KitShipmentHistoryModule {}
