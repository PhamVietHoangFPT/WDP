import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Type, TypeSchema } from './schemas/type.schema'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    ],
    exports: [MongooseModule],
})
export class TypeModule { }
