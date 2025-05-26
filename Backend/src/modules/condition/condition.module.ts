import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Condition, ConditionSchema } from './schemas/condition.schema'
import { ConditionController } from './condition.controller'
import { ConditionService } from './condition.service'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Condition.name, schema: ConditionSchema }]),
    ],
    controllers: [ConditionController],
    providers: [ConditionService],
    exports: [MongooseModule],
})
export class ConditionModule { }
