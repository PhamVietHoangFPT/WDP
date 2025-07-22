import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestResultShipmentHistory,
  TestResultShipmentHistorySchema,
} from './schemas/TestResultShipmentHistory.schema'
import { TestResultShipmentHistoryController } from './TestResultShipmentHistory.controller'
import { ITestResultShipmentHistoryService } from './interfaces/iTestResultShipmentHistory.service'
import { TestResultShipmentHistoryService } from './TestResultShipmentHistory.service'
import { ITestResultShipmentHistoryRepository } from './interfaces/iTestResultShipmentHistory.repository'
import { TestResultShipmentHistoryRepository } from './TestResultShipmentHistory.repository'
import { AuthModule } from '../auth/auth.module'
import { ShipmentStatusModule } from '../shipmentStatus/shipmentStatus.modules'
import { TestResultShipmentModule } from '../testResultShipment/testResultShipment.module'

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
