import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Relationship, RelationshipSchema } from './schemas/relationship.schema'


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Relationship.name, schema: RelationshipSchema }]),
    ],
    exports: [MongooseModule],
})
export class RelationshipModule { }
