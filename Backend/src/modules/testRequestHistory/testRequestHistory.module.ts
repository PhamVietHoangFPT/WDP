import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestRequestHistory,
  TestRequestHistorySchema,
} from './schemas/testRequestHistory.schema'
import { TestRequestHistoryController } from './testRequestHistory.controller'
import { ITestRequestHistoryService } from './interfaces/itestRequestHistory.service'
import { TestRequestHistoryService } from './testRequestHistory.service'
import { ITestRequestHistoryRepository } from './interfaces/itestRequestHistory.repository'
import { TestRequestHistoryRepository } from './testRequestHistory.repository'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestRequestHistory.name, schema: TestRequestHistorySchema },
    ]),
    AuthModule,
  ],
  controllers: [TestRequestHistoryController],
  providers: [
    {
      provide: ITestRequestHistoryRepository,
      useClass: TestRequestHistoryRepository,
    },
    {
      provide: ITestRequestHistoryService,
      useClass: TestRequestHistoryService,
    },
  ],
  exports: [
    ITestRequestHistoryRepository,
    ITestRequestHistoryService,
    MongooseModule,
  ],
})
export class TestRequestHistoryModule {}
