import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Relationship, RelationshipSchema } from './schemas/relationship.schema'
import { RelationshipController } from './relationship.controller'
import { IRelationshipService } from './interfaces/irelationship.service'
import { RelationshipService } from './relationship.service'
import { IRelationshipRepository } from './interfaces/iRelationship.repository'
import { RelationshipRepository } from './relationship.repository'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Relationship.name, schema: RelationshipSchema },
    ]),
    AuthModule,
  ],
  controllers: [RelationshipController],
  providers: [
    {
      provide: IRelationshipRepository,
      useClass: RelationshipRepository
    },
    {
      provide: IRelationshipService,
      useClass: RelationshipService
    },

  ],
  exports: [MongooseModule],
})
export class RelationshipModule { }
