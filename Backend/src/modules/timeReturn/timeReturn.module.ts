import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TimeReturn, TimeReturnSchema } from './schemas/timeReturn.schema'


@Module({
    imports: [
        MongooseModule.forFeature([{ name: TimeReturn.name, schema: TimeReturnSchema }]),
    ],
    exports: [MongooseModule],
})
export class TimeReturnModule { }
