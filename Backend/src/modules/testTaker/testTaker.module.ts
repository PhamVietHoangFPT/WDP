// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TestTaker, TestTakerSchema } from './schemas/testTaker.schema'
import { TestTakerRelationshipModule } from '../testTakerRelationship/testTakerRelationship.module'
import { AccountModule } from '../account/account.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestTaker.name, schema: TestTakerSchema },
    ]),
    TestTakerRelationshipModule,
    AccountModule,
  ],

  exports: [MongooseModule],
})
export class TestTakerModule {}
