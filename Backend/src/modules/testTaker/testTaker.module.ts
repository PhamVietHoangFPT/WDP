// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TestTaker, TestTakerSchema } from './schemas/testTaker.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestTaker.name, schema: TestTakerSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class TestTakerModule {}
