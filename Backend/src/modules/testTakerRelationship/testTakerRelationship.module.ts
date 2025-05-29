// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TestTakerRelationship,
  TestTakerRelationshipSchema,
} from './schemas/testTakerRelationship.schema'
// import { TestTakerModule } from '../testTaker/testTaker.module'
// import { AuthModule } from '../auth/auth.module'
import { TestTakerRelationshipController } from './testtaker-relationship.controller'
import { ITestTakerRelationshipRepository } from './interfaces/itestTakerRelationship.repository'
import { TestTakerRelationshipRepository } from './testTaker-relationship.respository'
import { ITestTakerRelationshipService } from './interfaces/itestTakerRelationship.service'
import { TestTakerRelationshipService } from './testtaker-relationship.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestTakerRelationship.name, schema: TestTakerRelationshipSchema },
    ]),

    // AuthModule,
  ],
  controllers: [TestTakerRelationshipController],

  providers: [
    {
      provide: ITestTakerRelationshipRepository,
      useClass: TestTakerRelationshipRepository,
    },
    {
      provide: ITestTakerRelationshipService,
      useClass: TestTakerRelationshipService,
    },
  ],

  exports: [ITestTakerRelationshipRepository, ITestTakerRelationshipService],
})
export class TestTakerRelationshipModule {}
