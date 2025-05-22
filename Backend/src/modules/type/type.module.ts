import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Type, TypeSchema } from './schemas/type.schema'
import { ConditionModule } from '../condition/condition.module'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
        ConditionModule,
    ],
    exports: [MongooseModule],
})
export class TypeModule { }
