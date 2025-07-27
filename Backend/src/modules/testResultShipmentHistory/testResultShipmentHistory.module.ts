import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestResultShipmentHistory,
  TestResultShipmentHistorySchema,
} from './schemas/TestResultShipmentHistory.schema'
import { AuthModule } from '../auth/auth.module'
import { ShipmentStatusModule } from '../shipmentStatus/shipmentStatus.modules'
import { TestResultShipmentModule } from '../testResultShipment/testResultShipment.module'
import { TestResultShipmentHistoryController } from './testResultShipmentHistory.controller'
import { ITestResultShipmentHistoryRepository } from './interfaces/itestResultShipmentHistory.repository'
import { TestResultShipmentHistoryRepository } from './testResultShipmentHistory.repository'
import { ITestResultShipmentHistoryService } from './interfaces/itestResultShipmentHistory.service'
import { TestResultShipmentHistoryService } from './testResultShipmentHistory.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TestResultShipmentHistory.name,
        schema: TestResultShipmentHistorySchema,
      },
    ]),
    AuthModule,
    ShipmentStatusModule,
    TestResultShipmentModule,
  ],
  controllers: [TestResultShipmentHistoryController],
  providers: [
    {
      provide: ITestResultShipmentHistoryRepository,
      useClass: TestResultShipmentHistoryRepository,
    },
    {
      provide: ITestResultShipmentHistoryService,
      useClass: TestResultShipmentHistoryService,
    },
  ],
  exports: [
    ITestResultShipmentHistoryRepository,
    ITestResultShipmentHistoryService,
    MongooseModule,
  ],
})
export class TestResultShipmentHistoryModule {}
