// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestTakerRelationship,
  TestTakerRelationshipSchema,
} from './schemas/testTakerRelationship.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestTakerRelationship.name, schema: TestTakerRelationshipSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class TestTakerRelationshipModule {}
