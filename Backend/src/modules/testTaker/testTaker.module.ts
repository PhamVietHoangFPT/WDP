// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TestTaker, TestTakerSchema } from './schemas/testTaker.schema'
import { AccountModule } from '../account/account.module'
import { TestTakerController } from './testTaker.controller'
import { ITestTakerService } from './interfaces/itestTaker.service'
import { TestTakerRepository } from './testTaker.repository'
import { TestTakerService } from './testTaker.service'
import { ITestTakerRepository } from './interfaces/itestTaker.repository'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestTaker.name, schema: TestTakerSchema },
    ]),
    AccountModule,
    AuthModule,
  ],
  controllers: [TestTakerController],

  providers: [
    { provide: ITestTakerRepository, useClass: TestTakerRepository },
    {
      provide: ITestTakerService,
      useClass: TestTakerService,
    },
  ],
  exports: [ITestTakerRepository, ITestTakerService],
})
export class TestTakerModule {}
