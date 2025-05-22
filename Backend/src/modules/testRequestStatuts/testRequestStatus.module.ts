// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from './schemas/testRequestStatus.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestRequestStatus.name, schema: TestRequestStatusSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class TestRequestStatusModule {}
