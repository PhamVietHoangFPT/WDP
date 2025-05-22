import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Condition, ConditionSchema } from './schemas/condition.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condition.name, schema: ConditionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ConditionModule {}
